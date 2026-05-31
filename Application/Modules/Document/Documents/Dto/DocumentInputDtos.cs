using System;
using System.Collections.Generic;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Document.Documents.Commands
{
    public record DocumentMemberInputDto
    {
        public Guid MemberId { get; set; }
        public DocumentMemeberRole Role { get; set; }
        public bool IsMention { get; set; } = false;

        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<DocumentMemberInputDto, Novologs.Domain.Entities.DocumentNodeMember>();
            }
        }
    }

    public record DocumentMemberUpdateDto
    {
        public Guid? Id { get; set; }
        public Guid? MemberId { get; set; }
        public DocumentMemeberRole Role { get; set; }
        public bool IsMention { get; set; } = false;

        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<DocumentMemberUpdateDto, Novologs.Domain.Entities.DocumentNodeMember>();
                ;
            }
        }
    }

    public record DocumentVersionInputDto
    {
        public Guid? Id { get; set; } = null;
        public string? Version { get; set; } = null;
        public string? Title { get; init; } = null!;
        public string? Description { get; init; } = null!;
        public string? Content { get; init; } = null!;
        public Guid? HeaderImgFileId { get; init; }
        public List<Guid>? FilesIds { get; init; }

        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<DocumentVersionInputDto, Novologs.Domain.Entities.DocumentVersion>();
            }
        }
    }
}
