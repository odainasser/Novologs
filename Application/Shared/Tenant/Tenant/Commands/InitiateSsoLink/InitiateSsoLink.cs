using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Services;
using Novologs.Application.Tenant.Commands.AcceptSsoLink;
using Novologs.Domain.Entities;

namespace Novologs.Application.Tenant.Commands.InitiateSsoLink;

public record InitiateSsoLinkCommand : IRequest<Result<InitiateSsoLinkResponse>>
{
    public string TargetTenantAccessToken { get; set; } = null!;
}

public class InitiateSsoLinkResponse
{
    public string? UserFullName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserProfilePictureUrl { get; set; }
}

public class InitiateSsoLinkCommandValidator : AbstractValidator<InitiateSsoLinkCommand>
{
    public InitiateSsoLinkCommandValidator()
    {
        RuleFor(x => x.TargetTenantAccessToken).NotEmpty();
    }
}

public class InitiateSsoLinkCommandHandler : IRequestHandler<InitiateSsoLinkCommand, Result<InitiateSsoLinkResponse>>
{
    private readonly IUser _user;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ITenantDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;

    public InitiateSsoLinkCommandHandler(ITenantDbContext context, IUser user,
        IHttpClientFactory httpClientFactory, IHttpContextAccessor httpContextAccessor,
        IConfiguration configuration)
    {
        _context = context;
        _user = user;
        _httpClientFactory = httpClientFactory;
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;
    }

    public async Task<Result<InitiateSsoLinkResponse>> Handle(InitiateSsoLinkCommand request,
        CancellationToken cancellationToken)
    {
        var handler = new JwtSecurityTokenHandler();
        var targetToken = handler.ReadJwtToken(request.TargetTenantAccessToken);

        var targetTenantId = Guid.Parse(targetToken.Claims
            .First(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/system").Value);
        var targetDomain = targetToken.Claims
            .First(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri").Value;
        var targetUserId = Guid.Parse(targetToken.Claims
            .First(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier").Value);
        var targetTenantName = targetToken.Issuer;

        var existingLink = await _context.GetSet<TenantUsersLinkedTo>()
            .AnyAsync(
                x => x.SourceUserId == _user.IdGuid && x.TargetTenantId == targetTenantId &&
                     x.TargetUserId == targetUserId, cancellationToken);
        if (existingLink)
        {
            return Result<InitiateSsoLinkResponse>.Failure("SsoLink.AlreadyExists", "SSO link already exists.");
        }

        var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            return Result<InitiateSsoLinkResponse>.Failure("SsoLink.NoToken",
                "Authorization header with bearer token is required.");
        }

        var sourceUserToken = authorizationHeader.Substring("Bearer ".Length);

        var currentUser = await _context.GetSet<TenantUser>().Include(x => x.ProfileImageFile)
            .FirstOrDefaultAsync(x => x.Id == _user.IdGuid, cancellationToken);
        if (currentUser == null)
        {
            return Result<InitiateSsoLinkResponse>.Failure("SsoLink.UserNotFound", "Current user not found.");
        }

        var client = _httpClientFactory.CreateClient();
        var acceptSsoLinkRequest = new AcceptSsoLinkCommand
        {
            SourceTenantAccessToken = sourceUserToken,
            UserFullName = currentUser.FullName,
            UserEmail = currentUser.Email,
            UserProfilePictureUrl = currentUser.ProfileImageFile?.Url
        };
        var defaultHttpSchema = _configuration["DefaultHttpSchema"];
        if (string.IsNullOrEmpty(defaultHttpSchema))
        {
            defaultHttpSchema = "http://"; // Default to http if not configured
        }

        //add jwt bearer token to the request
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.TargetTenantAccessToken);
        var response = await client.PostAsJsonAsync($"{defaultHttpSchema}{targetDomain}/tenant/Tenant/sso/accept",
            acceptSsoLinkRequest, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            return Result<InitiateSsoLinkResponse>.Failure("SsoLink.AcceptFailed",
                $"Failed to accept SSO link on target tenant: {errorContent}");
        }

        var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
        var acceptResponse = System.Text.Json.JsonSerializer.Deserialize<Result<AcceptSsoLinkResponse>>(responseString,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });


        if (acceptResponse == null || acceptResponse.Succeeded == false)
        {
            return Result<InitiateSsoLinkResponse>.Failure("SsoLink.InvalidResponse",
                "Invalid response from target tenant.");
        }

        var linkTokenHash = ComputeSha256Hash(acceptResponse.SuccessStatus!.LinkToken);

        var newLink = new TenantUsersLinkedTo(Guid.NewGuid())
        {
            SourceUserId = _user.IdGuid!.Value,
            TargetTenantId = targetTenantId,
            TargetDomain = targetDomain,
            TargetTenantName = targetTenantName,
            TargetUserId = targetUserId,
            TargetUserFullName = acceptResponse.SuccessStatus.UserFullName,
            TargetUserEmail = acceptResponse.SuccessStatus.UserEmail,
            TargetUserProfilePictureUrl = acceptResponse.SuccessStatus.UserProfilePictureUrl,
            LinkTokenHash = linkTokenHash,
            IsActive = true
        };

        _context.GetSet<TenantUsersLinkedTo>().Add(newLink);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<InitiateSsoLinkResponse>.Success(new InitiateSsoLinkResponse
        {
            UserFullName = acceptResponse.SuccessStatus.UserFullName,
            UserEmail = acceptResponse.SuccessStatus.UserEmail,
            UserProfilePictureUrl = acceptResponse.SuccessStatus.UserProfilePictureUrl
        });
    }

    private static string ComputeSha256Hash(string rawData)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            var builder = new StringBuilder();
            foreach (var b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }

            return builder.ToString();
        }
    }
}
