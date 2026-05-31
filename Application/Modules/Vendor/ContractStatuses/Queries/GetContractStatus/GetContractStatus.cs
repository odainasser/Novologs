using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Vendor.ContractStatuses.Queries.GetContractStatus;

public record GetContractStatusQuery : IRequest<Result<GetContractStatusResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetContractStatusResponse : FilteredResult<ContractStatuseDto>
{
}

public class ContractStatuseDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.VendorContractStatus, ContractStatuseDto>();
        }
    }
}

public class GetContractStatusQueryValidator : AbstractValidator<GetContractStatusQuery>
{
    public GetContractStatusQueryValidator(ITenantDbContext context, IUser user)
    {
    }
}

public class GetContractStatusQueryHandler : IRequestHandler<GetContractStatusQuery, Result<GetContractStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetContractStatusQueryHandler(ITenantDbContext context, IUser user, IMapper mapper,
        UserManager<TenantUser> userManager, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<GetContractStatusResponse>> Handle(GetContractStatusQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetContractStatusResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.VendorContractStatus>()
            .AsNoTracking().AsSplitQuery();

        // Check if the user has the "ReadVendorContractStatus" permission 
        var hasPermission = await _httpContextAccessor.HttpContext!.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Vendors.ReadVendorContractStatus);

        if (!hasPermission)
        {
            // If the user doesn't have the permission, filter by creator
            query = query.Where(vc => vc.CreatedBy == _user.Id);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ContractStatuseDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetContractStatusResponse>.Success(result);
    }
}
