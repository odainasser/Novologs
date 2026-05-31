using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Vendor.ContractTypes.Queries.GetContractType;

public record GetContractTypeQuery : IRequest<Result<GetContractTypeResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetContractTypeResponse : FilteredResult<ContractTypeDto>
{
}

public class ContractTypeDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.VendorContractType, ContractTypeDto>();
        }
    }
}

public class GetContractTypeQueryValidator : AbstractValidator<GetContractTypeQuery>
{
    public GetContractTypeQueryValidator(ITenantDbContext context, IUser user)
    {
    }
}

public class GetContractTypeQueryHandler : IRequestHandler<GetContractTypeQuery, Result<GetContractTypeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public GetContractTypeQueryHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetContractTypeResponse>> Handle(GetContractTypeQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetContractTypeResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.VendorContractType>("")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ContractTypeDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetContractTypeResponse>.Success(result);
    }
}
