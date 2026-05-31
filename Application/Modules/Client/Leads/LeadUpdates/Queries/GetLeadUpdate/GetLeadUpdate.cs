using System.ComponentModel;
using Novologs.Application.Modules.Client.Leads.LeadUpdates.Dto;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;

namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Queries.GetLeadUpdate;

[AuthorizePermission(Novologs.Domain.Constants.Permissions.Clients.ReadLeadUpdate)]
public record GetLeadUpdateQuery : IRequest<Result<GetLeadUpdateResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName (e.g., \"Description\", \"Status\", \"LeadId\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName, SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("The ID of the lead for which to retrieve updates.")]
    public Guid? LeadId { get; set; }
}

public class GetLeadUpdateResponse : FilteredResult<LeadUpdateDto> { }

public class GetLeadUpdateQueryValidator : AbstractValidator<GetLeadUpdateQuery>
{
    public GetLeadUpdateQueryValidator(ITenantDbContext context)
    {
        RuleFor(v => v.LeadId)
            .MustAsync(async (leadId, cancellationToken) =>
            {
                if (!leadId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(l => l.Id == leadId, cancellationToken);
            }).WithMessage("Lead not found.");
    }
}

public class GetLeadUpdateQueryHandler : IRequestHandler<GetLeadUpdateQuery, Result<GetLeadUpdateResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetLeadUpdateQueryHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<GetLeadUpdateResponse>> Handle(GetLeadUpdateQuery request, CancellationToken cancellationToken)
    {
        var result = new GetLeadUpdateResponse();

        if (_user.IdGuid == null)
        {
            return Result<GetLeadUpdateResponse>.Failure("LeadUpdate_003", "User not found.");
        }

        var userId = _user.IdGuid.Value;

        var query = _context.GetSet<Novologs.Domain.Entities.LeadUpdate>()
            .Include(lu => lu.Lead)
                .ThenInclude(l => l!.LeadMembers)
            .Include(lu => lu.Creator)
                .ThenInclude(c => c!.ProfileImageFile)
            .Where(lu => lu.Lead != null &&
                         (lu.Lead.CreatedBy == _user.Id ||
                          lu.Lead.LeadMembers.Any(lm => lm.MemberId == userId && !lm.IsDeleted)))
            .AsNoTracking()
            .AsSplitQuery();

        if (request.LeadId.HasValue)
            query = query.Where(lu => lu.LeadId == request.LeadId.Value);

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);
        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query
            .ProjectTo<LeadUpdateDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetLeadUpdateResponse>.Success(result);
    }
}
