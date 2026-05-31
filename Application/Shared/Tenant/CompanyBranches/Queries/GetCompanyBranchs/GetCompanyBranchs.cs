using Novologs.Application.Common.Interfaces;
using Novologs.Application.CompanyBranches.Dto;

namespace Novologs.Application.CompanyBranches.Queries.GetCompanyBranch;

using System.ComponentModel;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration; 

public record GetCompanyBranchesQuery : IRequest<Result<GetCompanyBranchesQueryResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName, FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName, SortDirection, and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description(
        "Pagination criteria. Specify PageNumber (1-based) and PageSize. default null to get all the items")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetCompanyBranchesQueryValidator : AbstractValidator<GetCompanyBranchesQuery>
{
    public GetCompanyBranchesQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetCompanyBranchesQueryResponse : FilteredResult<CompanyBranchDto>
{
}

public class GetCompanyBranchesQueryHandler : IRequestHandler<GetCompanyBranchesQuery, Result<GetCompanyBranchesQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetCompanyBranchesQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetCompanyBranchesQueryResponse>> Handle(GetCompanyBranchesQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetCompanyBranchesQueryResponse();
        var query = _context.GetSet<Domain.Entities.CompanyBranch>("").AsNoTracking().AsSplitQuery();
        try
        {
            query = query.ApplySearch(request.Search);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }

        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query
            .ProjectTo<CompanyBranchDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetCompanyBranchesQueryResponse>.Success(result);
    }
}
