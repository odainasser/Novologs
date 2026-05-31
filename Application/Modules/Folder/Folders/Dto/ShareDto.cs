using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Dto;

public class ShareDto
{
    public Guid Id { get; set; }
    public Guid FolderId { get; set; }
    public Guid SharedByUserId { get; set; }
    public Guid SharedWithUserId { get; set; }
    public FolderUser? SharedWithUser { get; set; }

    public FolderSharePermissionLevel FolderSharePermissionLevel { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Share, ShareDto>()
                .ForMember(dest => dest.SharedWithUser, opt => opt.MapFrom(src => src.SharedWithUser))
                .ForMember(dest => dest.FolderSharePermissionLevel,
                    opt => opt.MapFrom(src => src.PermissionLevel))
                ;
        }
    }
}