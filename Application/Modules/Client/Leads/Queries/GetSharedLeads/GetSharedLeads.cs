using System.ComponentModel;
using Novologs.Application.Modules.Client.Leads.Dto;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Leads.Queries.GetSharedLeads;

public record GetSharedLeadsQuery : IRequest<Result<GetSharedLeadsResponse>>, IFilter
{
    [Description("Search criteria for shared leads.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName, SortDirection (asc/desc).")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetSharedLeadsResponse : FilteredResult<ClientLeadDto>
{
}

public class GetSharedLeadsQueryHandler : IRequestHandler<GetSharedLeadsQuery, Result<GetSharedLeadsResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public GetSharedLeadsQueryHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetSharedLeadsResponse>> Handle(GetSharedLeadsQuery request, CancellationToken cancellationToken)
    {
        var result = new GetSharedLeadsResponse();

        if (_user.IdGuid == null)
        {
            return Result<GetSharedLeadsResponse>.Failure("Lead_005", "User not found.");
        }

        var userId = _user.IdGuid.Value;

        // Get leads where:
        // 1. The current user is a member (explicitly exclude soft-deleted members) OR
        // 2. The current user is the creator and the lead is shared
        var query = _context.GetSet<ClientLead>()
            .Include(l => l.Creator)
            .Include(l => l.LeadMembers.Where(lm => !lm.IsDeleted))
                .ThenInclude(lm => lm.Member)
            .Where(l => 
                l.LeadMembers.Any(lm => lm.MemberId == userId && !lm.IsDeleted) ||
                (l.CreatorId == userId && l.IsShared))
            .AsNoTracking()
            .AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        // Include CreatorId in projection to determine masking without additional queries
        var leads = await query
            .Select(l => new { Lead = l, l.CreatorId })
            .ToListAsync(cancellationToken);

        var items = _mapper.Map<List<ClientLeadDto>>(leads.Select(x => x.Lead));

        // Mask client details for team members (not creators)
        for (int i = 0; i < leads.Count; i++)
        {
            if (leads[i].CreatorId != userId)
            {
                // Hide client identity fields
                items[i].ClientId = null;
                items[i].Client = null;
            }
        }

        result.Items = items;

        return Result<GetSharedLeadsResponse>.Success(result);
    }
}
