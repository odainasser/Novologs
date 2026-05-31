namespace Novologs.Application.Modules.Folder.Folders.Dto;

public class FolderProject
{
    public string? Code { get; set; } = null!;
    public long Serial { get; set; }
    public string Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Project, FolderProject>();
        }
    }
}