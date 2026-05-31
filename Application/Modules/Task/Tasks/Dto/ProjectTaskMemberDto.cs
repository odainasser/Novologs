using Novologs.Application.Designations.DTOs;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Tasks.Dto;

public class ProjectTaskMemberDto
{
    public Guid? Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid MemberId { get; set; }
    public Guid? StatusId { get; set; }
    public LocalizableTextDto? StatusName { get; set; }
    public string? StatusColor { get; set; }
    public string? MemberName { get; set; }
    public LocalizableTextDto? Designation { get; set; }
    public string? ProfileImageFileUrl { get; set; }


    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }


    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<ProjectTaskMember, ProjectTaskMemberDto>()
                .ForMember(dest => dest.MemberName,
                    opt => opt.MapFrom(src => src.TenantUser!.FullName))
                .ForMember(dest => dest.Designation,
                    opt => opt.MapFrom(src => src.TenantUser!.Designation!.Name))
                .ForMember(dest => dest.StatusName,
                    opt => opt.MapFrom(src => src.Status != null ? src.Status.Name : null))
                .ForMember(dest => dest.StatusColor,
                    opt => opt.MapFrom(src => src.Status != null ? src.Status.Color : null))
                .ForMember(dest => dest.ProfileImageFileUrl,
                    opt => opt.MapFrom(src => src.TenantUser!.ProfileImageFile != null
                        ? src.TenantUser.ProfileImageFile.Url
                        : null))
                ;
            ;
        }
    }
}
