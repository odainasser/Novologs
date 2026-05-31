using System.ComponentModel;
using Novologs.Application.Modules.Client.Leads.Dto;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Sources.Queries.GetSource;

public record GetSourceQuery : IRequest<Result<GetSourceResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"NameId\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetSourceResponse : FilteredResult<LeadSourceDto>
{
}

public class GetSourceQueryValidator : AbstractValidator<GetSourceQuery>
{
    public GetSourceQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetSourceQueryHandler : IRequestHandler<GetSourceQuery, Result<GetSourceResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetSourceQueryHandler(ITenantDbContext context, IMapper mapper,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetSourceResponse>> Handle(GetSourceQuery request, CancellationToken cancellationToken)
    {
        var result = new GetSourceResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.LeadSource>("")
            .AsNoTracking().AsSplitQuery();
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetSourceResponse>.Failure("Source_001", "User not found.");
        }

        var hasPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Clients.ReadLeadSource);

        if (!hasPermission)
        {
            query = query.Where(x => x.CreatedBy == _user.Id);
        }


        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<LeadSourceDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetSourceResponse>.Success(result);
    }
}
