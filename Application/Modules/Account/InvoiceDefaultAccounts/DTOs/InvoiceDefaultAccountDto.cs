using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.InvoiceDefaultAccounts.DTOs;

public class InvoiceDefaultAccountDto
{
    public Guid Id { get; set; }
    public InvoiceCategory InvoiceCategory { get; set; }
    public InvoiceAccountRole InvoiceAccountRole { get; set; }
    public Guid AccountId { get; set; }
    public string AccountCode { get; set; } = default!;
    public string AccountName { get; set; } = default!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.InvoiceDefaultAccount, InvoiceDefaultAccountDto>()
                .ForMember(d => d.AccountCode, opt => opt.MapFrom(s => s.Account.Code))
                .ForMember(d => d.AccountName, opt => opt.MapFrom(s => s.Account.Name));
        }
    }
}
