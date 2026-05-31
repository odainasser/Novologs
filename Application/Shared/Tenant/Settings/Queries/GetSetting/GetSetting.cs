using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;

namespace Novologs.Application.Settings.Queries.GetSetting;

public record GetSettingQuery : IRequest<Result<GetSettingResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetSettingResponse : FilteredResult<SettingDto>
{
}

public class SettingDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; }
    public string? Extra { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.Setting, SettingDto>();
        }
    }
}

public class GetSettingQueryValidator : AbstractValidator<GetSettingQuery>
{
    public GetSettingQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetSettingQueryHandler : IRequestHandler<GetSettingQuery, Result<GetSettingResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public GetSettingQueryHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetSettingResponse>> Handle(GetSettingQuery request, CancellationToken cancellationToken)
    {
        var result = new GetSettingResponse();
        var query = _context.GetSet<Domain.Entities.Setting>()
            .AsNoTracking();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<SettingDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetSettingResponse>.Success(result);
    }
}
