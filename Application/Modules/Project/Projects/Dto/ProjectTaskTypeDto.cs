using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Project.Projects.Dto;

public class ProjectTaskTypeDto
{
    public Guid? Id { get; set; }
    public Guid NameId { get; set; }
    public LocalizableTextDto? Name { get; set; }
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectTaskType, ProjectTaskTypeDto>();
            CreateMap<Novologs.Domain.Entities.ProjectTaskTypeProject, ProjectTaskTypeDto>()
                .ForMember(dest => dest.NameId, opt => opt.MapFrom(src => src.ProjectTaskType!.NameId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.ProjectTaskType!.Name));

        }
    }
}
