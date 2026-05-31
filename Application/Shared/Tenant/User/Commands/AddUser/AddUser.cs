using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Tenant;
using Novologs.Domain.Enums;

namespace Novologs.Application.User.Commands.AddUser;

public record AddUserCommand : IRequest<Result<AddUserResponse>>
{
    public string? Code { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? UserName { get; set; } = null;
    public string? PhoneNumber { get; set; }
    public string Email { get; set; } = null!;
    public string? Country { get; set; } = "UAE";
    public string? Language { get; set; } = "EN";
    public decimal? HourlyRate { get; set; } = 0;

    public UserType UserType { get; set; } = UserType.Internal;
    public Guid? HierarchyParentId { get; set; } = null;
    public Guid? DesignationId { get; set; } = null;
    public Guid? DepartmentId { get; set; } = null;
    public Guid? ProfileImageFileId { get; set; }
    public Guid? CompanyBranchId { get; set; }

    public int TaskLevelElveator { get; set; } = 0;
    public List<string> Roles { get; set; } = new List<string>();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddUserCommand, TenantUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName ?? src.Email))
                .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Code))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Country, opt => opt.MapFrom(src => src.Country))
                .ForMember(dest => dest.Language, opt => opt.MapFrom(src => src.Language))
                .ForMember(dest => dest.UserType, opt => opt.MapFrom(src => src.UserType))
                .ForMember(dest => dest.DesignationId, opt => opt.MapFrom(src => src.DesignationId))
                .ForMember(dest => dest.DepartmentId, opt => opt.MapFrom(src => src.DepartmentId))
                .ForMember(dest => dest.ProfileImageFileId, opt => opt.MapFrom(src => src.ProfileImageFileId))
                .ForMember(dest => dest.CompanyBranchId, opt => opt.MapFrom(src => src.CompanyBranchId))
                .ForMember(dest => dest.TaskLevelElveator, opt => opt.MapFrom(src => src.TaskLevelElveator))
                .ForMember(dest => dest.HourlyRate, opt => opt.MapFrom(src => src.HourlyRate))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                ;
        }
    }
}

public class AddUserResponse
{
    public Guid Id { get; set; }
}

public class AddUserCommandHandler : IRequestHandler<AddUserCommand, Result<AddUserResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly UserManager<TenantUser> _userManager;

    public AddUserCommandHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IMapper mapper,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _userManager = userManager;
        _mapper = mapper;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<AddUserResponse>> Handle(AddUserCommand request, CancellationToken cancellationToken)
    {
        var user = _mapper.Map<TenantUser>(request);
        user.EmailConfirmed = false;
        var defaultPassword = Guid.NewGuid().ToString();

        //if designation is null, use the default designation employee
        if (request.DesignationId == null)
        {
            var defaultDesignation = await _context.GetSet<Designation>().Where(d => d.Name.Value == "Employee")
                .FirstOrDefaultAsync(cancellationToken);

            if (defaultDesignation is null)
            {
                return Result<AddUserResponse>.Failure("User_005", "Default Designations not found");
            }

            user.DesignationId = defaultDesignation?.Id;
        }

        //if department is null use the default department general
        if (request.DepartmentId == null)
        {
            var defaultDepartment = await _context.GetSet<Department>().Where(d => d.Name.Value == "General")
                .FirstOrDefaultAsync(cancellationToken);
            if (defaultDepartment is null)
            {
                return Result<AddUserResponse>.Failure("User_005", "Default Departments not found");
            }

            user.DepartmentId = defaultDepartment?.Id;
        }

        var existingUser = await _userManager.FindByNameAsync(user.UserName!);
        if (existingUser != null)
        {
            return Result<AddUserResponse>.Failure("User_006", "A user with this username or email already exists");
        }

        var existingEmail = await _userManager.FindByEmailAsync(user.Email!);
        if (existingEmail != null)
        {
            return Result<AddUserResponse>.Failure("User_006", "A user with this email already exists");
        }

        var result = await _userManager.CreateAsync(user, defaultPassword);


        if (result.Succeeded)
        {
            var rolesToAdd = new List<string>();

            if (request.Roles?.Any() != true)
            {
                rolesToAdd.Add(Domain.Constants.Roles.Internal);
            }
            else if (request.Roles.Contains(Domain.Constants.Roles.External) && request.Roles.Count == 1)
            {
                rolesToAdd.Add(Domain.Constants.Roles.External);
            }
            else if (!request.Roles.Contains(Domain.Constants.Roles.Internal))
            {
                rolesToAdd.Add(Domain.Constants.Roles.Internal);
            }

            if (request.Roles != null)
            {
                rolesToAdd.AddRange(request.Roles);
            }

            await _userManager.AddToRolesAsync(user, rolesToAdd.Distinct().ToArray());
        }
        else
        {
            return Result<AddUserResponse>.Failure("User_005",
                result.Errors.Select(e => e.Description).FirstOrDefault() ?? "Create user error");
        }

        //if HierarchyParentId is null, then use the default department general hierarchy
        if (request.HierarchyParentId == null)
        {
            var defaultDepartment = await _context.GetSet<Department>().Where(d => d.Name.Value == "General")
                .FirstOrDefaultAsync(cancellationToken);
            if (defaultDepartment is null)
            {
                return Result<AddUserResponse>.Failure("User_005", "Default department not found");
            }

            var defaultOrganizationStructure = await _context.GetSet<OrganizationStructure>()
                .Where(d => d.DepartmentId == defaultDepartment.Id).FirstOrDefaultAsync(cancellationToken);

            if (defaultOrganizationStructure is null)
            {
                return Result<AddUserResponse>.Failure("User_005",
                    "Default Departments Organization Structure not found");
            }

            request.HierarchyParentId = defaultOrganizationStructure?.Id;
        }

        //add user as a child node to OrganizationStructure with the HierarchyParentId
        var organizationStructure = new OrganizationStructure(Guid.NewGuid())
        {
            ParentStructureId = request.HierarchyParentId, EmployeeId = user.Id
        };

        await _context.GetSet<OrganizationStructure>().AddAsync(organizationStructure, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        code = System.Net.WebUtility.UrlEncode(code);
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var ActionLink = $"http://{tenantInfo?.Domain}/auth/confirm-email?Code={code}&userId={user.Id}";
        _sendEmailAndNotificationService.SendEmail(new EmailData()
        {
            TenantId = tenantInfo?.Id,
            EmailTemplate = EmailTemplate.CompanyConfirmEmail,
            UserInfo =
                new List<EmailUserInfo>() { new() { Email = user.Email!, FirstName = user.FullName, Id = user.Id } },
            Subject = "Confirm your email",
            ActionLink = ActionLink
        });

        return Result<AddUserResponse>.Success(new AddUserResponse() { Id = user.Id });
    }
}
