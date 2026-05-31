namespace Novologs.Application.Modules.Folder.Folders.Dto;

public class FolderMilestone
{
    public string Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectMileStone, FolderMilestone>();
        }
    }
}