namespace Novologs.Application.Modules.Folder.Folders.Dto;

public class FolderTask
{
    public string? Code { get; set; } = null!;
    public long Serial { get; set; }
    public string? Description { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectTask, FolderTask>();
        }
    }
}