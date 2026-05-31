using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Project.Projects.Dto;

public class ProjectModuleDto
{
    public Guid? Id { get; set; }
    public Guid? ProjectId { get; set; }

    public Guid? NameId { get; set; }
    public LocalizableTextDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectModule, ProjectModuleDto>();
            CreateMap<ProjectModuleDto, Novologs.Domain.Entities.ProjectModule>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id ?? Guid.NewGuid()))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null))
                ;
        }
    }
}
