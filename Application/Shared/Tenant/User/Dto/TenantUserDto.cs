using SystemLoaders.Services;
using Novologs.Application.Localizables.DTOs;
using Novologs.Application.WorkStatuss.Dto;
using Novologs.Application.WorkStatuss.Queries.GetWorkStatus;
using Novologs.Domain.Enums;

namespace Novologs.Application.User.Dto;

public class TenantUserDto
{
    public Guid? Id { get; set; }
    public long Serial { get; set; }
    public bool IsActive { get; set; }
    public string? Code { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Country { get; set; }
    public string? Language { get; set; }
    public decimal? HourlyRate { get; set; } = 0;

    public UserType UserType { get; set; }
    public Guid? DesignationId { get; set; }
    public Guid? ProfileImageFileId { get; set; }
    public string? ProfileImageFileUrl { get; set; }

    public Guid? CompanyBranchId { get; set; }
    public string? CompanyBranchName { get; set; }
    public int TaskLevelElveator { get; set; } = 0;

    public Guid? FolderId { get; set; }

    public int Level { get; set; } = 0;
    public string? ParentName { get; set; }
    public Guid? ParentId { get; set; }
    public LocalizableTextDto? DesignationName { get; set; }
    public Guid? DepartmentId { get; set; }
    public LocalizableTextDto? DepartmentName { get; set; }

    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }

    public UserWorkStatusDto? LastWorkStatus { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    //add role permission mapping
    public Dictionary<string, List<string>> RolePermissions { get; set; } = new();

    public Guid? RootFolderId { get; set; }

    public UserLoginInfoDto LastLoginInfo { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.TenantUser, TenantUserDto>()
                .ForMember(dest => dest.DesignationName,
                    opt => opt.MapFrom(src => src.Designation != null ? src.Designation.Name : null))
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
                .ForMember(dest => dest.ProfileImageFileUrl,
                    opt => opt.MapFrom(src => src.ProfileImageFile != null ? src.ProfileImageFile.Url : null))
                .ForMember(dest => dest.LastWorkStatus,
                    opt => opt.MapFrom(src => src.UserWorkStatuses.OrderByDescending(uws => uws.Created)
                        .FirstOrDefault(uws =>
                            (uws.EndDate == null || uws.EndDate > DateTime.Now) && (uws.StartDate < DateTime.Now))))
                .ForMember(dest => dest.LastLoginInfo,
                    opt => opt.MapFrom(src => src.UserLoginInfos.OrderByDescending(uli => uli.LastLogin)
                        .FirstOrDefault()))
                .ForMember(dest => dest.CompanyBranchName,
                    opt => opt.MapFrom(src => src.CompanyBranch != null ? src.CompanyBranch.Name : null))
                ;
        }
    }
}

public class UserLoginInfoDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid AcceessTokenJti { get; set; }
    public Novologs.Domain.Enums.DeviceType DeviceType { get; set; }
    public string? DeviceTypeData { get; set; }
    public string? FcmDeviceToken { get; set; }
    public DateTime LastLogin { get; set; }
    public DateTime ValidTill { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.UserLoginInfo, UserLoginInfoDto>();
        }
    }
}
