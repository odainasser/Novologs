using System.ComponentModel;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Departments.Queries.GetDepartment;

public record GetDepartmentQuery : IRequest<Result<GetDepartmentResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName(e.g., \"Name.LocalizedStrings.Value\", \"Employees.FullName\", " +
                 "\"ChildDepartments.Name.LocalizedStrings.Value\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetDepartmentQueryValidator : AbstractValidator<GetDepartmentQuery>
{
    public GetDepartmentQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetDepartmentResponse : FilteredResult<DepartmentDto>
{
}

public class GetDepartmentQueryHandler : IRequestHandler<GetDepartmentQuery, Result<GetDepartmentResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetDepartmentQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetDepartmentResponse>> Handle(GetDepartmentQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetDepartmentResponse();
        var allDepartement = await _context
            .GetSet<Domain.Entities.Department>("Name.LocalizedStrings,ChildDepartments,Employees")
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);

        var query = allDepartement.AsQueryable().ApplySearch(request.Search);
        result.Total = query.Count();

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = query
            .ProjectTo<DepartmentDto>(_mapper.ConfigurationProvider)
            .ToList();
        foreach (var department in result.Items)
        {
            var domainDepartment = allDepartement
                .FirstOrDefault(d => d.Id == department.Id);
            department.EmployeeCount = CalculateEmployeeCount(domainDepartment);
        }

        return Result<GetDepartmentResponse>.Success(result);
    }

    private int CalculateEmployeeCount(Department? department)
    {
        if (department == null) return 0;
        var count = department.Employees.Count;
        foreach (var child in department.ChildDepartments)
        {
            count += CalculateEmployeeCount(child);
        }

        return count;
    }
}
