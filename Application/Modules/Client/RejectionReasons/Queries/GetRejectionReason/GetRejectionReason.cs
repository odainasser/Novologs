using System.ComponentModel;
using Novologs.Application.Modules.Client.Leads.Dto;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.RejectionReasons.Queries.GetRejectionReason;

public record GetRejectionReasonQuery : IRequest<Result<GetRejectionReasonResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"NameId\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetRejectionReasonResponse : FilteredResult<LeadRejectionReasonDto>
{
}

public class GetRejectionReasonQueryValidator : AbstractValidator<GetRejectionReasonQuery>
{
    public GetRejectionReasonQueryValidator(ITenantDbContext context)
    {
    }
}

public class
    GetRejectionReasonQueryHandler : IRequestHandler<GetRejectionReasonQuery, Result<GetRejectionReasonResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetRejectionReasonQueryHandler(ITenantDbContext context, IMapper mapper, IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetRejectionReasonResponse>> Handle(GetRejectionReasonQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetRejectionReasonResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>("")
            .AsNoTracking().AsSplitQuery();
        if (_user.IdGuid == null)
        {
            return Result<GetRejectionReasonResponse>.Failure("RejectionReason_001", "User not found.");
        }

        if (!await _userManager.HasPermissionAsync(_context, _user.IdGuid.Value,
                Novologs.Domain.Constants.Permissions.Clients.ReadLeadRejectionReason))
        {
            query = query.Where(r => r.CreatedBy == _user.Id);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<LeadRejectionReasonDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetRejectionReasonResponse>.Success(result);
    }
}
