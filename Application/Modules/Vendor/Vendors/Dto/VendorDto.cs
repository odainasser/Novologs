using Novologs.Application.User.Dto;

namespace Novologs.Application.Modules.Vendor.Vendors.Dto;

public class VendorDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Phonenumber { get; set; }
    public string? Emirate { get; set; }
    public double? LocationLatitude { get; set; }
    public double? LocationLongitude { get; set; }
    public Guid? LogoFileId { get; set; }
    public string? LogoFileUrl { get; set; }
    public bool IsAccount { get; set; }


    public Guid? RootFolderId { get; set; }

    public Guid CreatorId { get; set; }
    public TenantUserDto? Creator { get; set; }

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }
    public int ContractCount { get; set; }
    public double? ContractAmount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Vendor, VendorDto>()
                .ForMember(dest => dest.LogoFileUrl,
                    opt => opt.MapFrom(src => src.LogoFile != null ? src.LogoFile.Url : null))
                ;
        }
    }
}
