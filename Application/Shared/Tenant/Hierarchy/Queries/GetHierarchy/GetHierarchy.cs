using System.ComponentModel;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Hierarchy.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Queries.GetHierarchy;

public record GetHierarchyQuery : IRequest<Result<GetHierarchyResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Employee.FullName\", \"Department.Name.LocalizedStrings.Value\"," +
        " \"ParentStructure.Employee.FullName\", \"ParentStructure.Department.Name.LocalizedStrings.Value\"," +
        " \"Children.Employee.FullName\", \"Children.Department.Name.LocalizedStrings.Value\"" + "), " +
        "FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetHierarchyQueryValidator : AbstractValidator<GetHierarchyQuery>
{
    public GetHierarchyQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetHierarchyResponse : FilteredResult<OrganizationStructureDto>
{
}

public class GetHierarchyQueryHandler : IRequestHandler<GetHierarchyQuery, Result<GetHierarchyResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetHierarchyQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetHierarchyResponse>> Handle(GetHierarchyQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetHierarchyResponse();
        var query = _context
            .GetSet<OrganizationStructure>("Employee,Department.Name.LocalizedStrings")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query
            .ProjectTo<OrganizationStructureDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);


        return Result<GetHierarchyResponse>.Success(result);
    }
}
