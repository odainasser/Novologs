using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Dto;

public class FolderUser
{
    public long Serial { get; set; }

    public string FullName { get; set; } = null!;

    public LocalizableTextDto? Designation { get; set; }
    public LocalizableTextDto? Department { get; set; }

    public string? ProfileImageUrl { get; set; }

    public FolderSharePermissionLevel FolderSharePermissionLevel { get; set; } = FolderSharePermissionLevel.View;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TenantUser, FolderUser>()
                .ForMember(dest => dest.Designation, opt => opt.MapFrom(src => src.Designation!.Name))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department!.Name))
                .ForMember(dest => dest.ProfileImageUrl,
                    opt => opt.MapFrom(src => src.ProfileImageFile != null ? src.ProfileImageFile.Url : null));

            CreateMap<Novologs.Domain.Entities.Share, FolderUser>()
                .ForMember(dest => dest.Serial, opt => opt.MapFrom(src => src.SharedWithUser!.Serial))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.SharedWithUser!.FullName))
                .ForMember(dest => dest.Designation, opt => opt.MapFrom(src => src.SharedWithUser!.Designation!.Name))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.SharedWithUser!.Department!.Name))
                .ForMember(dest => dest.FolderSharePermissionLevel, opt => opt.MapFrom(src => src.PermissionLevel))
                .ForMember(dest => dest.ProfileImageUrl,
                    opt => opt.MapFrom(src =>
                        src.SharedWithUser!.ProfileImageFile != null ? src.SharedWithUser.ProfileImageFile.Url : null))
                ;
        }
    }
}