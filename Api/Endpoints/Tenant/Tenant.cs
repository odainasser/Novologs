using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.Tenant.Commands.AcceptSsoLink;
using Novologs.Application.Tenant.Commands.ActivateDeactivateSsoLink;
using Novologs.Application.Tenant.Commands.DeleteTenantSsoLink;
using Novologs.Application.Tenant.Commands.GenerateSsoToken;
using Novologs.Application.Tenant.Commands.InitiateSsoLink;
using Novologs.Application.Tenant.Commands.InitTenant;
using Novologs.Application.Tenant.Commands.SsoLogin;
using Novologs.Application.Tenant.Queries.GetTenantInfo;
using Novologs.Application.Tenant.Queries.GetTenantSsoLinks;

namespace Novologs.Api.Endpoints.Tenant;

public class Tenant : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/Tenant").WithTags("Tenant").WithOpenApi();
        group.MapPost("/init", InitTenant).AllowAnonymous();
        group.MapGet("/info", GetTenantInfo);
        
        var ssoGroup = group.MapGroup("/sso");
        
        ssoGroup.MapPost("/login", SsoLogin).AllowAnonymous();
        
        ssoGroup.MapGet("/links", GetTenantSsoLinks);
        ssoGroup.MapPost("/initiate", InitiateSsoLink);
        ssoGroup.MapPost("/accept", AcceptSsoLink);
        ssoGroup.MapPost("/generate-token", GenerateSsoToken);
        ssoGroup.MapPut("/link/status", ActivateDeactivateSsoLink);
        ssoGroup.MapDelete("/link", DeleteTenantSsoLink);
    }

    public async Task<Result<GetTenantInfoResponse>> GetTenantInfo([FromServices] ISender sender)
    {
        return await sender.Send(new GetTenantInfoQuery());
    }

    public async Task<InitTenantResponse> InitTenant([FromServices] ISender sender,
        [FromBody] InitTenantCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<GetTenantSsoLinksResponse>> GetTenantSsoLinks([FromServices] ISender sender, Guid? userId)
    {
        return await sender.Send(new GetTenantSsoLinksQuery { UserId = userId });
    }

    public async Task<Result<InitiateSsoLinkResponse>> InitiateSsoLink([FromServices] ISender sender,
        [FromBody] InitiateSsoLinkCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<AcceptSsoLinkResponse>> AcceptSsoLink([FromServices] ISender sender,
        [FromBody] AcceptSsoLinkCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<GenerateSsoTokenResponse>> GenerateSsoToken([FromServices] ISender sender,
        [FromBody] GenerateSsoTokenCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<SsoLoginResponse>> SsoLogin([FromServices] ISender sender,
        [FromBody] SsoLoginCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<ActivateDeactivateSsoLinkResponse>> ActivateDeactivateSsoLink(
        [FromServices] ISender sender, [FromBody] ActivateDeactivateSsoLinkCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteTenantSsoLinkResponse>> DeleteTenantSsoLink([FromServices] ISender sender,
        Guid linkId, LinkDirection linkDirection)
    {
        return await sender.Send(new DeleteTenantSsoLinkCommand { LinkId = linkId, LinkDirection = linkDirection });
    }
}