using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;

namespace Novologs.Application.Modules.Document.CommentThreads.Queries.GetCommentThread;


public class CommentThreadDto
{
    public Guid Id { get; set; }
    public List<CommentItemDto> Items { get; set; } = new();

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.CommentThread, CommentThreadDto>();
        }
    }
}

public class CommentItemDto
{
    public Guid Id { get; set; }
    public string? Content { get; set; }
    public Guid ThreadId { get; set; }
    public Guid SenderId { get; set; }
    public TenantUserDto? Sender { get; set; }
    public List<CommentFileDto> Files { get; set; } = new();
    public List<CommentMentionDto> Mentions { get; set; } = new();

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.CommentItem, CommentItemDto>();
        }
    }
}

public class CommentFileDto
{
    public Guid Id { get; set; }
    public Guid FileId { get; set; }
    public FolderDto? File { get; set; }
    public Guid CommentItemId { get; set; }

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.CommentFile, CommentFileDto>();
        }
    }
}

public class CommentMentionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public TenantUserDto? User { get; set; }
    public Guid CommentItemId { get; set; }

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.CommentMention, CommentMentionDto>();
        }
    }
}

public class TenantUserDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string? ProfileImageUrl { get; set; }


    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TenantUser, TenantUserDto>()
                .ForMember(dest => dest.ProfileImageUrl,
                    opt => opt.MapFrom(src => src.ProfileImageFile != null ? src.ProfileImageFile.Url : null));
        }
    }
}

public class FolderDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Url { get; set; }

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Folder, FolderDto>();
        }
    }
}
