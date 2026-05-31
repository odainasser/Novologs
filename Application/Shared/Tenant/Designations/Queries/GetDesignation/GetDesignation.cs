using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Designations.DTOs;

namespace Novologs.Application.Designations.Queries.GetDesignation;

public record GetDesignationQuery : IRequest<Result<GetDesignationResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetDesignationQueryValidator : AbstractValidator<GetDesignationQuery>
{
    public GetDesignationQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetDesignationResponse: FilteredResult<DesignationDto>
{
    
}

public class GetDesignationQueryHandler : IRequestHandler<GetDesignationQuery, Result<GetDesignationResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetDesignationQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetDesignationResponse>> Handle(GetDesignationQuery request, CancellationToken cancellationToken)
    { 
        var result = new GetDesignationResponse();
        var allDesignations = await _context
            .GetSet<Domain.Entities.Designation>("Name.LocalizedStrings,Employees")
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);

        var query = allDesignations.AsQueryable().ApplySearch(request.Search);
        result.Total = query.Count();

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = query
            .ProjectTo<DesignationDto>(_mapper.ConfigurationProvider)
            .ToList(); 
        return Result<GetDesignationResponse>.Success(result);

        
    }
}
