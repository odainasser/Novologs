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
using Novologs.Application.Modules.Vendor.Vendors.Dto;

namespace Novologs.Application.Modules.Vendor.Vendors.Queries.GetVendor;

[Description("Retrieves a list of vendors with pagination, sorting, and filtering options. " +
             "This tool is suitable for dynamic data and should not be cached.")]
public record GetVendorQuery : IRequest<Result<GetVendorResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Code\", \"Serial\" , \"Name\", \"Website\", \"Address\", \"Email\", \"Phonenumber\", \"Emirate\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
    public bool? IsAccount { get; init; }
}

public class GetVendorResponse : FilteredResult<VendorDto>
{
}

public class GetVendorQueryValidator : AbstractValidator<GetVendorQuery>
{
    public GetVendorQueryValidator()
    {
    }
}

public class GetVendorQueryHandler : IRequestHandler<GetVendorQuery, Result<GetVendorResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IUser _user;

    public GetVendorQueryHandler(ITenantDbContext context, IMapper mapper,
        UserManager<TenantUser> userManager, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
        _user = user;
    }

    public async Task<Result<GetVendorResponse>> Handle(GetVendorQuery request, CancellationToken cancellationToken)
    {
        var result = new GetVendorResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.Vendor>("")
            .AsNoTracking().AsSplitQuery();

        if (_user.IdGuid == null)
        {
            return Result<GetVendorResponse>.Failure("Vendor_001", "User not found.");
        }

        var canViewAllVendors = await _userManager.HasPermissionAsync(_context, _user.IdGuid.Value,
            Novologs.Domain.Constants.Permissions.Vendors.VendorViewAll);
        var canViewAllGeneral = await _userManager.HasPermissionAsync(_context, _user.IdGuid.Value,
            Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (!canViewAllVendors && !canViewAllGeneral)
        {
            query = query.Where(v => v.CreatorId == _user.IdGuid);
        }

        if (request.IsAccount.HasValue)
        {
            query = query.Where(v => v.IsAccount == request.IsAccount.Value);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<VendorDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        if (result.Items.Any())
        {
            var vendorIdList = result.Items.Select(c => c.Id).ToList();
            var contractList = await _context.GetSet<VendorContract>()
                .Where(l => vendorIdList.Contains(l.VendorId))
                .ToListAsync(cancellationToken);

            var vendorsFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .Include(f => f.Subfolders)
                .FirstOrDefaultAsync(f => f.Type == FolderType.General && f.Name == Constants.FolderNames.Vendors,
                    cancellationToken);

            foreach (var vendorDto in result.Items)
            {
                var rootFolder = vendorsFolder?.Subfolders?.FirstOrDefault(f => f.VendorId == vendorDto.Id);
                vendorDto.RootFolderId = rootFolder?.Id;

                vendorDto.ContractCount =
                    contractList.Count(l => l.VendorId == vendorDto.Id);
                vendorDto.ContractAmount = contractList
                    .Where(l => l.VendorId == vendorDto.Id)
                    .Sum(l => l.Value);
            }
        }


        return Result<GetVendorResponse>.Success(result);
    }
}
