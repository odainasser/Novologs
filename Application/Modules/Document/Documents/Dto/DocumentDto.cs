using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Document.Documents.Queries.GetDocument;

public class DocumentDto
{
    public Guid Id { get; set; }

    public string? Code { get; set; }
    public long Serial { get; set; }

    public string? CurrentVersion { get; set; }

    public Guid? ParentDocumentId { get; set; }
    public Novologs.Domain.Enums.DocumentNodeType Type { get; set; }
    public Novologs.Domain.Enums.DocumentNodeVisibility Visibiltiy { get; set; }
    public Novologs.Domain.Enums.DocumentNodeStatus Status { get; set; }

    public DocumentCategoryDto? DocumentCategory { get; set; }
    public DocumentUserDto? Creator { get; set; }
    public List<DocumentVersionDto>? DocumentVersionList { get; set; }

    public List<DocumentMemberDto>? Members { get; set; }
    public List<DocumentSimpleDto>? ChildrenNodes { get; set; }

    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }

    public Guid? TaskId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? MileStoneId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? ClientLeadId { get; set; }
    public Guid? VendorId { get; set; }
    public Guid? VendorContractId { get; set; }
    public Guid? CommentThreadId { get; set; }
    public Guid? RootFolderId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.DocumentNode, DocumentDto>()
                .ForMember(dest => dest.RootFolderId, opt => opt.MapFrom(src => src.FolderId))
                ;
        }
    }
}

public class DocumentSimpleDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }
    public string? CurrentVersion { get; set; }
    public Novologs.Domain.Enums.DocumentNodeType Type { get; set; }
    public Novologs.Domain.Enums.DocumentNodeVisibility Visibiltiy { get; set; }
    public Novologs.Domain.Enums.DocumentNodeStatus Status { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.DocumentNode, DocumentSimpleDto>();
        }
    }
}

public class DocumentCategoryDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.DocumentCategory, DocumentCategoryDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class DocumentUserDto
{
    public Guid Id { get; set; }
    public string? UserName { get; set; }
    public string? FullName { get; set; }
    public string? ProfileImageUrl { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TenantUser, DocumentUserDto>()
                .ForMember(dest => dest.ProfileImageUrl,
                    opt => opt.MapFrom(src => src.ProfileImageFile != null ? src.ProfileImageFile.Url : ""))
                ;
        }
    }
}

public class DocumentVersionDto
{
    public Guid? Id { get; set; } = null;
    public string? Title { get; init; } = null!;
    public string? Description { get; init; } = null!;
    public string? Content { get; init; } = null!;
    public Guid? HeaderImgFileId { get; init; }
    public Novologs.Domain.Entities.Folder? HeaderImgFile { get; init; }

    public List<DocumentFileDto>? Files { get; set; }

    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.DocumentVersion, DocumentVersionDto>();
        }
    }
}

public class DocumentFileDto
{
    public Guid FileId { get; set; }
    public string? Name { get; set; }
    public long? Size { get; set; }
    public string? MimeType { get; set; }
    public string? Url { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.DocumentFile, DocumentFileDto>();
        }
    }
}

public class DocumentMemberDto
{
    public Guid Id { get; set; }
    public Guid MemberId { get; set; }
    public DocumentUserDto? Member { get; set; }
    public Novologs.Domain.Enums.DocumentMemeberRole Role { get; set; }
    public bool IsMention { get; set; } = false;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.DocumentNodeMember, DocumentMemberDto>()
                .ForMember(dest => dest.Member, opt => opt.MapFrom(src => src.Member));
            ;
        }
    }
}
