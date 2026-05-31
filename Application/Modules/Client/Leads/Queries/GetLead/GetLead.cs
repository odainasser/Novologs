using System.ComponentModel;
using Novologs.Application.Modules.Client.Leads.Dto;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Tenant;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Queries.GetLead;

public record GetLeadQuery : IRequest<Result<GetLeadResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Code\", \"Serial\" , \"Name\", \"CreatorId\", \"ClientId\", " +
        "\"LeadSourceId\", \"Value\", \"CurrencyId\", \"ExpectedAwardedDate\", \"LeadStatus\", \"SaleStatusId\", " +
        "\"AwardedValue\", \"AwardedCurrencyId\", \"AwardedDate\", \"RejectedDate\", \"RejectionReasonId\", " +
        "\"FolderId\", \"DocumentId\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("The ID of the client for which to retrieve leads.")]
    public Guid? ClientId { get; set; }

    public bool? MyLeads { get; set; }
}

public class GetLeadResponse : FilteredResult<ClientLeadDto>
{
}

public class GetLeadQueryValidator : AbstractValidator<GetLeadQuery>
{
    public GetLeadQueryValidator(ITenantDbContext context)
    {
        RuleFor(x => x.ClientId)
            .MustAsync(async (clientId, cancellationToken) =>
            {
                if (clientId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(c => c.Id == clientId, cancellationToken);
            }).WithMessage("Client not found.");
    }
}

public class GetLeadQueryHandler : IRequestHandler<GetLeadQuery, Result<GetLeadResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public GetLeadQueryHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetLeadResponse>> Handle(GetLeadQuery request, CancellationToken cancellationToken)
    {
        var result = new GetLeadResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.ClientLead>("")
            .AsNoTracking().AsSplitQuery();

        if (_user.IdGuid == null)
        {
            return Result<GetLeadResponse>.Failure("Lead_001", "User not found.");
        }

        var userId = _user.IdGuid.Value;

        // Batch all 3 permission checks into two queries instead of ~12 round-trips
        var userDirectPermissions = await _context.GetSet<UserPermission>()
            .AsNoTracking()
            .Where(up => up.UserId == userId)
            .Select(up => up.Permission.Name)
            .ToListAsync(cancellationToken);

        var userRoleIds = await _context.GetSet<IdentityUserRole<Guid>>()
            .AsNoTracking()
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.RoleId)
            .ToListAsync(cancellationToken);

        var rolePermissions = userRoleIds.Count > 0
            ? await _context.GetSet<RolePermission>()
                .AsNoTracking()
                .Where(rp => userRoleIds.Contains(rp.RoleId))
                .Select(rp => rp.Permission.Name)
                .ToListAsync(cancellationToken)
            : new List<string>();

        var effectivePermissions = userDirectPermissions.Concat(rolePermissions).ToHashSet();

        var hasClientViewAllPermission = effectivePermissions.Contains(Permissions.Clients.ViewAllClients);
        var hasLeadViewAllPermission = effectivePermissions.Contains(Permissions.Clients.ViewAllLeads);
        var hasGeneralViewAllPermission = effectivePermissions.Contains(Permissions.General.ViewAll);

        if (!hasClientViewAllPermission && !hasLeadViewAllPermission && !hasGeneralViewAllPermission)
        {
            query = query.Where(x => x.CreatorId == userId
                                     || x.Client!.CreatorId == userId
                                     || x.LeadMembers.Any(lm => lm.MemberId == userId && !lm.IsDeleted));
        }

        if (request.ClientId.HasValue)
        {
            query = query.Where(x => x.ClientId == request.ClientId);
        }

        if (request.MyLeads.HasValue && request.MyLeads.Value)
        {
            query = query.Where(x => x.CreatorId == userId);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ClientLeadDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        if (result.Items.Count > 0)
        {
            var pageLeadIds = result.Items
                .Where(l => l.Id.HasValue)
                .Select(l => l.Id!.Value)
                .ToList();

            // Load folders scoped to current page only
            var folderByLead = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .AsNoTracking()
                .Where(f => f.Type == FolderType.Shared && f.LeadId.HasValue && pageLeadIds.Contains(f.LeadId.Value))
                .Select(f => new { f.Id, f.LeadId })
                .ToDictionaryAsync(f => f.LeadId!.Value, f => f.Id, cancellationToken);

            // Load members for page leads in one batch to avoid N+1
            var membersByLead = await _context.GetSet<LeadMember>()
                .AsNoTracking()
                .Where(lm => pageLeadIds.Contains(lm.LeadId) && !lm.IsDeleted)
                .Select(lm => new { lm.LeadId, lm.MemberId })
                .ToListAsync(cancellationToken);

            var memberLookup = membersByLead
                .GroupBy(lm => lm.LeadId)
                .ToDictionary(g => g.Key, g => g.Select(lm => lm.MemberId).ToHashSet());

            foreach (var leadDto in result.Items)
            {
                if (leadDto.Id.HasValue)
                {
                    if (folderByLead.TryGetValue(leadDto.Id.Value, out var folderId))
                        leadDto.RootFolderId = folderId;

                    // Mask client details for shared members who are not the creator
                    if (leadDto.CreatorId != userId)
                    {
                        var isMember = memberLookup.TryGetValue(leadDto.Id.Value, out var memberIds)
                                       && memberIds.Contains(userId);
                        if (isMember)
                        {
                            leadDto.ClientId = null;
                            leadDto.Client = null;
                        }
                    }
                }
            }
        }

        return Result<GetLeadResponse>.Success(result);
    }
}
