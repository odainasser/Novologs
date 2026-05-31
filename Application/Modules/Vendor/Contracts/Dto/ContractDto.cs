using Novologs.Application.Currencys.Dto;
using Novologs.Application.User.Dto;
using Novologs.Application.Modules.Vendor.Vendors.Dto;

namespace Novologs.Application.Modules.Vendor.Contracts.Dto;

public class ContractDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public Guid VendorId { get; set; }
    public VendorDto? Vendor { get; set; }
  
    public Guid? VendorContractTypeId { get; set; }
    public VendorContractTypeDto? VendorContractType { get; set; }

    public Guid? VendorContractStatusId { get; set; }
    public VendorContractStatusDto? VendorContractStatus { get; set; }
    
    public double Value { get; set; }
    public Guid CurrencyId { get; set; }
    public CurrencyDto? Currency { get; set; }
    public DateTime? ExpectedStartDate { get; set; }
    public DateTime? ExpectedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    
    public Guid? RootFolderId { get; set; }

    public Guid CreatorId { get; set; }
    public TenantUserDto? Creator { get; set; }

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.VendorContract, ContractDto>();
        }
    }
}
public class VendorContractTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.VendorContractType, VendorContractTypeDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name.Value));
        }
    }
}

public class VendorContractStatusDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.VendorContractStatus, VendorContractStatusDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name.Value));
        }
    }
}
