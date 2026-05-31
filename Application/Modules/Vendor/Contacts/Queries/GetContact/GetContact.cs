using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Vendor.Contacts.Queries.GetContact;

public record GetContactQuery : IRequest<Result<GetContactResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetContactResponse : FilteredResult<ContactDto>
{
}

public class ContactDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? MobileNumber { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Designation { get; set; }
    public Guid? VendorId { get; set; }
    public string? VendorName { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Contact, ContactDto>()
                .ForMember(dest => dest.VendorName,
                    opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Name : null));
        }
    }
}

public class GetContactQueryValidator : AbstractValidator<GetContactQuery>
{
    public GetContactQueryValidator(ITenantDbContext context, IUser user)
    {
    }
}

public class GetContactQueryHandler : IRequestHandler<GetContactQuery, Result<GetContactResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager; 
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetContactQueryHandler(ITenantDbContext context, IMapper mapper, IUser user, UserManager<TenantUser> userManager, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<GetContactResponse>> Handle(GetContactQuery request, CancellationToken cancellationToken)
    {
        var result = new GetContactResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.Contact>()
            .Include(c => c.Vendor)
            .AsNoTracking().AsSplitQuery();

        // Check if the user has the "ReadVendorContact" permission 
        var hasPermission = await _httpContextAccessor.HttpContext!.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Vendors.ReadVendorContact);

        if (!hasPermission)
        {
            // If the user doesn't have the permission, filter by vendor creator
            query = query.Where(c => c.Vendor != null && c.Vendor.CreatorId == _user.IdGuid);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ContactDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetContactResponse>.Success(result);
    }
}
