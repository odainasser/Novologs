using Novologs.Application.User.Dto;

namespace Novologs.Application.Modules.Client.Clients.Dto;

public class ClientDto
{
    public Guid? Id { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }

    public string Name { get; set; } = null!;
    public string Website { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phonenumber { get; set; } = null!;
    public string Emirate { get; set; } = null!;
    public double LocationLatitude { get; set; }
    public double LocationLongitude { get; set; }
 
    public Guid CreatorId { get; set; }
    public TenantUserDto? Creator { get; set; }

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }

    public Guid? RootFolderId { get; set; }

    public Guid? LogoFileId { get; set; }
    public string? LogoFileUrl { get; set; }
    public bool IsAccount { get; set; }
    public int LeadCount { get; set; }
    public double? LeadAmount { get; set; }
    public int SalesCount { get; set; }
    public double? SalesAmount { get; set; }
    public int RejectedCount { get; set; }
    public double? RejectedAmount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Client, ClientDto>()
                .ForMember(dest => dest.LogoFileUrl,
                    opt => opt.MapFrom(src => src.LogoFile != null ? src.LogoFile.Url : null))
                ;
        }
    }
}
