namespace Novologs.Application.Modules.Folder.Folders.Dto;

public class FolderDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsFile { get; set; } = false;
    public string? MimeType { get; set; }
    public long? Size { get; set; }
    public string? Url { get; set; }
    public string? Path { get; set; }
    
    public Novologs.Domain.Enums.FolderType Type { get; set; }


    public Guid? ParentFolderId { get; set; }

    public Guid CreatorId { get; set; }
    public FolderUser? Creator { get; set; }

    public Guid? ProjectId { get; set; }
    public FolderProject? Project { get; set; }

    public Guid? MilestoneId { get; set; }
    public FolderMilestone? Milestone { get; set; }

    public Guid? ClientId { get; set; }
    public FolderClient? Client { get; set; }

    public Guid? LeadId { get; set; }
    public FolderLead? Lead { get; set; }

    public Guid? VendorId { get; set; }
    public FolderVendor? Vendor { get; set; }

    public Guid? ContractId { get; set; }
    public FolderContract? Contract { get; set; }

    public Guid? TaskId { get; set; }
    public FolderTask? Task { get; set; }

    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }

    public ICollection<FolderDto> Subfolders { get; set; } = new HashSet<FolderDto>();
    public ICollection<ShareDto> Shares { get; set; } = new HashSet<ShareDto>();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Folder, FolderDto>()
                .ForMember(dest => dest.Creator, opt => opt.MapFrom(src => src.Creator))
                .ForMember(dest => dest.Project, opt => opt.MapFrom(src => src.Project))
                .ForMember(dest => dest.Milestone, opt => opt.MapFrom(src => src.Milestone))
                .ForMember(dest => dest.Client, opt => opt.MapFrom(src => src.Client))
                .ForMember(dest => dest.Lead, opt => opt.MapFrom(src => src.Lead))
                .ForMember(dest => dest.Vendor, opt => opt.MapFrom(src => src.Vendor))
                .ForMember(dest => dest.Contract, opt => opt.MapFrom(src => src.Contract))
                .ForMember(dest => dest.Task, opt => opt.MapFrom(src => src.Task))
                .ForMember(dest => dest.Shares, opt => opt.MapFrom(src => src.Shares));
        }
    }
}