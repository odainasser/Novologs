using Novologs.Application.Localizables.DTOs;
using Novologs.Application.WorkStatuss.Dto;
using Novologs.Domain.Entities;

namespace Novologs.Application.UserGroups.Queries.GetUserGroup;

public class UserGroupDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }
    public string Name { get; set; } = null!;

    public Guid? CreatorUserId { get; set; }
    public TenantUserUserGroupDto? CreatorUser { get; set; }
    public DateTimeOffset Created { get; set; }
    
    public List<UserGroupMemberDto> Members { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UserGroup, UserGroupDto>()
                .ForMember(dest => dest.CreatorUser, opt => opt.MapFrom(src => src.CreatorUser))
                .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members));;
        }
    }
}

public class UserGroupMemberDto
{
    public Guid Id { get; set; }
    public Guid UserGroupId { get; set; }
    public Guid UserId { get; set; }
    public TenantUserUserGroupDto? User { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UserGroupMember, UserGroupMemberDto>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User));
            ;
        }
    }
}

public class TenantUserUserGroupDto
{
    public Guid Id { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public LocalizableTextDto? DesignationName { get; set; }
    public LocalizableTextDto? DepartmentName { get; set; }
    public UserWorkStatusDto? LastWorkStatus { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }


    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TenantUser, TenantUserUserGroupDto>()
                .ForMember(dest => dest.ProfileImageUrl,
                    opt => opt.MapFrom(src => src.ProfileImageFile != null ? src.ProfileImageFile.Url : null))
                .ForMember(dest => dest.DesignationName,
                    opt => opt.MapFrom(src => src.Designation != null ? src.Designation.Name : null))
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
                .ForMember(dest => dest.LastWorkStatus,
                    opt => opt.MapFrom(src => src.UserWorkStatuses.OrderByDescending(uws => uws.Created)
                        .FirstOrDefault(uws =>
                            (uws.EndDate == null || uws.EndDate > DateTime.Now) && (uws.StartDate < DateTime.Now))))
                ;
        }
    }
}
