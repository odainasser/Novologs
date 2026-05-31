using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.User.Dto;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Queries.GetMyEmployees;

public record GetMyEmployeesQuery : IRequest<Result<GetMyEmployeesResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }

    public SortFilter? Sort { get; set; }

    public PaginationFilter? Pagination { get; set; }

    public Guid? EmployeeId { get; set; }
}

public class GetMyEmployeesResponse : FilteredResult<TenantUserDto>
{
}

public class GetMyEmployeesQueryValidator : AbstractValidator<GetMyEmployeesQuery>
{
    public GetMyEmployeesQueryValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.EmployeeId)
            .MustAsync(async (employeeId, cancellationToken) =>
            {
                if (employeeId == null)
                {
                    return true;
                }

                return await context.GetSet<TenantUser>()
                    .AnyAsync(u => u.Id == employeeId, cancellationToken);
            }).WithMessage("EmployeeId is not valid.");
    }
}

public class GetMyEmployeesQueryHandler : IRequestHandler<GetMyEmployeesQuery, Result<GetMyEmployeesResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetMyEmployeesQueryHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<GetMyEmployeesResponse>> Handle(GetMyEmployeesQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetMyEmployeesResponse();
        var currentUserId = request.EmployeeId ?? _user.IdGuid;
        var allDescendantsIds = new List<Guid?>();


        var organizationStructure = await _context.GetSet<OrganizationStructure>()
            .Include(d => d.Children)
            .AsSingleQuery().AsNoTracking()
            .ToListAsync(cancellationToken);
        var currentUserNode = organizationStructure
            .FirstOrDefault(d => d.EmployeeId == currentUserId);

        if (currentUserNode != null)
        {
            allDescendantsIds = HierarchUtil.GetAllDescendantEmployeesIds(currentUserNode)
                .Select(id => (Guid?)id)
                .ToList();
        }
        else
        {
            allDescendantsIds.Add(currentUserId);
        }


        allDescendantsIds = allDescendantsIds.Where(id => id.HasValue).ToList();
        var query = _context.GetSet<TenantUser>()
            .Where(u => allDescendantsIds.Contains(u.Id))
            .AsNoTracking()
            .AsSplitQuery();


        query = query.ApplySearch(request.Search);
        result.Total = query.Count();

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = query
            .ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
            .ToList();

        return Result<GetMyEmployeesResponse>.Success(result);
    }
}
