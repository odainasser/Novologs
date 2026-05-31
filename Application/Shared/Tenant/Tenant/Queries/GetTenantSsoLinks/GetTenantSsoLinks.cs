using AutoMapper;
using AutoMapper.QueryableExtensions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Tenant.Queries.GetTenantSsoLinks;

public record GetTenantSsoLinksQuery : IRequest<Result<GetTenantSsoLinksResponse>>
{
    public Guid? UserId { get; set; }
}

public class GetTenantSsoLinksResponse
{
    public List<TenantUsersLinkedToDto> LinkedTo { get; set; } = new();
    public List<TenantUsersLinkedFromDto> LinkedFrom { get; set; } = new();
}

public class TenantUsersLinkedToDto
{
    public Guid Id { get; set; }
    public Guid SourceUserId { get; set; }
    public Guid TargetTenantId { get; set; }
    public string TargetDomain { get; set; } = null!;
    public string TargetTenantName { get; set; } = null!;
    public Guid TargetUserId { get; set; }
    public string? TargetUserFullName { get; set; }
    public string? TargetUserEmail { get; set; }
    public string? TargetUserProfilePictureUrl { get; set; }
    public bool IsActive { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TenantUsersLinkedTo, TenantUsersLinkedToDto>();
        }
    }
}

public class TenantUsersLinkedFromDto
{
    public Guid Id { get; set; }
    public Guid SourceTenantId { get; set; }
    public string SourceDomain { get; set; } = null!;
    public string SourceTenantName { get; set; } = null!;
    public Guid SourceUserId { get; set; }
    public string? SourceUserFullName { get; set; }
    public string? SourceUserEmail { get; set; }
    public string? SourceUserProfilePictureUrl { get; set; }
    public Guid TargetUserId { get; set; }
    public bool IsActive { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TenantUsersLinkedFrom, TenantUsersLinkedFromDto>();
        }
    }
}

public class GetTenantSsoLinksQueryValidator : AbstractValidator<GetTenantSsoLinksQuery>
{
    public GetTenantSsoLinksQueryValidator(ITenantDbContext context, IUser user)
    {
        When(x => x.UserId.HasValue, () =>
        {
            RuleFor(v => v.UserId)
                .MustAsync(async (id, cancellationToken) =>
                    await context.GetSet<TenantUser>().AnyAsync(p => p.Id == id, cancellationToken))
                .WithErrorCode("User.NotFound").WithMessage("The specified user not exists.");
        });
    }
}

public class GetTenantSsoLinksQueryHandler : IRequestHandler<GetTenantSsoLinksQuery, Result<GetTenantSsoLinksResponse>>
{
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;

    public GetTenantSsoLinksQueryHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetTenantSsoLinksResponse>> Handle(GetTenantSsoLinksQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _user.IdGuid;
        if (userId == null)
        {
            return Result<GetTenantSsoLinksResponse>.Failure("User.NotAuthenticated", "User is not authenticated.");
        }

        var linkedTo = await _context.GetSet<TenantUsersLinkedTo>()
            .AsNoTracking()
            .Where(x => x.SourceUserId == userId)
            .ProjectTo<TenantUsersLinkedToDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var linkedFrom = await _context.GetSet<TenantUsersLinkedFrom>()
            .AsNoTracking()
            .Where(x => x.TargetUserId == userId)
            .ProjectTo<TenantUsersLinkedFromDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var response = new GetTenantSsoLinksResponse
        {
            LinkedTo = linkedTo,
            LinkedFrom = linkedFrom
        };

        return Result<GetTenantSsoLinksResponse>.Success(response);
    }
}
