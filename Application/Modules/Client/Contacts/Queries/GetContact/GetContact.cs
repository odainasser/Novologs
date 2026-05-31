using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Contacts.Queries.GetContact;

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
    public Guid? ClientId { get; set; }
    public string? ClientName { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Contact, ContactDto>()
                .ForMember(dest => dest.ClientName,
                    opt => opt.MapFrom(src => src.Client != null ? src.Client.Name : null));
        }
    }
}

public class GetContactQueryValidator : AbstractValidator<GetContactQuery>
{
    public GetContactQueryValidator()
    {
    }
}

public class GetContactQueryHandler : IRequestHandler<GetContactQuery, Result<GetContactResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetContactQueryHandler(ITenantDbContext context, IMapper mapper, IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetContactResponse>> Handle(GetContactQuery request, CancellationToken cancellationToken)
    {
        var result = new GetContactResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.Contact>()
            .Include(c => c.Client)
            .AsNoTracking().AsSplitQuery();

        if (_user.IdGuid == null)
        {
            return Result<GetContactResponse>.Failure("Contact_001", "User not found.");
        }

        var hasPermission = await _userManager.HasPermissionAsync(_context, _user.IdGuid.Value,
            Novologs.Domain.Constants.Permissions.Clients.ViewAllClients) || await _userManager.HasPermissionAsync(_context, _user.IdGuid.Value, Novologs.Domain.Constants.Permissions.General.ViewAll);
        if (!hasPermission)
        {
            query = query.Where(c => c.CreatedBy == _user.Id);
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
