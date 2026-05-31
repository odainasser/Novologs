using System.ComponentModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Tenant;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;
using Novologs.Application.Modules.Vendor.Contracts.Dto;

namespace Novologs.Application.Modules.Vendor.Contracts.Queries.GetContract;

[Description("Retrieves a list of vendor contracts with pagination, sorting, and filtering options. " +
             "This tool is suitable for dynamic data and should not be cached.")]
public record GetContractQuery : IRequest<Result<GetContractResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Code\", \"Serial\" , \"Name\", \"Description\", \"Value\", \"ExpectedStartDate\", \"ExpectedEndDate\", \"ActualStartDate\", \"ActualEndDate\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("The ID of the vendor for which to retrieve contracts.")]
    public Guid? VendorId { get; set; }

    public bool? MyContracts { get; set; }
}

public class GetContractResponse : FilteredResult<ContractDto>
{
}

public class GetContractQueryValidator : AbstractValidator<GetContractQuery>
{
    public GetContractQueryValidator(ITenantDbContext context)
    {
        RuleFor(x => x.VendorId)
            .MustAsync(async (vendorId, cancellationToken) =>
            {
                if (vendorId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(c => c.Id == vendorId, cancellationToken);
            }).WithMessage("Vendor not found.");
    }
}

public class GetContractQueryHandler : IRequestHandler<GetContractQuery, Result<GetContractResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetContractQueryHandler(ITenantDbContext context, IUser user, IMapper mapper,
        UserManager<TenantUser> userManager, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<GetContractResponse>> Handle(GetContractQuery request, CancellationToken cancellationToken)
    {
        var result = new GetContractResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.VendorContract>()
            .Include(vc => vc.Vendor)
            .AsNoTracking().AsSplitQuery();

        // Check if the user has the "ReadContract" permission 
        var hasPermission = await _httpContextAccessor.HttpContext!.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Vendors.ContractViewAll)  || await _httpContextAccessor.HttpContext!.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (!hasPermission)
        {
            // If the user doesn't have the permission, filter by contract creator or vendor creator
            query = query.Where(vc =>
                vc.CreatorId == _user.IdGuid || (vc.Vendor != null && vc.Vendor.CreatorId == _user.IdGuid));
        }

        if (request.MyContracts == true)
        {
            query = query.Where(vc => vc.CreatorId == _user.IdGuid);
        }

        if (request.VendorId.HasValue)
        {
            query = query.Where(vc => vc.VendorId == request.VendorId.Value);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ContractDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        
        var contractFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .Where(f => f.Type == FolderType.Shared && f.ContractId != null)
            .ToListAsync(cancellationToken);

        foreach (var contractDto in result.Items)
        {
            var rootFolder = contractFolder.FirstOrDefault(f => f.ContractId == contractDto.Id);
            contractDto.RootFolderId = rootFolder?.Id;
        }

        return Result<GetContractResponse>.Success(result);
    }
}
