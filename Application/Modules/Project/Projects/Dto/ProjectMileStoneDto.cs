namespace Novologs.Application.Modules.Project.Projects.Dto;

public class ProjectMileStoneDto
{
    public Guid? Id { get; set; }
    public Guid? ProjectId { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;
    public Guid? RootFolderId { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectMileStone, ProjectMileStoneDto>();
        }
    }
}
