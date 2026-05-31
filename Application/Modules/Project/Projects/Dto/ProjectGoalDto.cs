using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Project.Projects.Dto;

public class ProjectGoalDto
{
    public Guid? Id { get; set; }
    public Guid NameId { get; set; }
    public LocalizableTextDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectGoal, ProjectGoalDto>();
        }
    }
}
