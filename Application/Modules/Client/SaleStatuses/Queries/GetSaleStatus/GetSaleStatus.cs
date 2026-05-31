using System.ComponentModel;
using Novologs.Application.Modules.Client.Leads.Dto;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.SaleStatuses.Queries.GetSaleStatus;

public record GetSaleStatusQuery : IRequest<Result<GetSaleStatusResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"NameId\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetSaleStatusResponse : FilteredResult<LeadSaleStatusDto>
{
}

public class GetSaleStatusQueryValidator : AbstractValidator<GetSaleStatusQuery>
{
    public GetSaleStatusQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetSaleStatusQueryHandler : IRequestHandler<GetSaleStatusQuery, Result<GetSaleStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IUser _user;

    public GetSaleStatusQueryHandler(ITenantDbContext context, IMapper mapper,
        UserManager<TenantUser> userManager, IUser user )
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
        _user = user;
    }

    public async Task<Result<GetSaleStatusResponse>> Handle(GetSaleStatusQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetSaleStatusResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>("")
            .AsNoTracking().AsSplitQuery();
        
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetSaleStatusResponse>.Failure("SaleStatus_001", "User not found.");
        }

        var hasPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Clients.ReadLeadSaleStatus);

        if (!hasPermission)
        {
            query = query.Where(x => x.CreatedBy == _user.Id);
        }


        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<LeadSaleStatusDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetSaleStatusResponse>.Success(result);
    }
}
