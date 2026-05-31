using Novologs.Application.User.Dto;

namespace Novologs.Application.Modules.Project.Projects.Dto;

public class ProjectMemberDto
{
    public Guid? Id { get; set; }
    public bool isOwner { get; set; } = false;

    public Guid MemberId { get; set; }
    public TenantUserDto Member { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectMember, ProjectMemberDto>();
            CreateMap<ProjectMemberDto, Novologs.Domain.Entities.ProjectMember>()
                .ForMember(dest => dest.Member, opt => opt.Ignore())
                .ForMember(dest => dest.Project, opt => opt.Ignore())
                .ForMember(dest => dest.MemberId, opt => opt.MapFrom(src => src.MemberId))
                .ForMember(dest => dest.isOwner, opt => opt.MapFrom(src => src.isOwner))
                ;
        }
    }
}
