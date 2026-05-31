using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.CreditNotes.DTOs;

public class CreditNoteItemDto
{
    public int Id { get; set; }
    public ProductSummaryDto? Product { get; set; }
    public UnitSummaryDto? Unit { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public DiscountType LineDiscountType { get; set; }
    public decimal LineDiscountValue { get; set; }
    public decimal LineDiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal LineBase { get; set; }
    public decimal LineDiscountAmount { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal AllocatedOverallDiscount { get; set; }
    public decimal FinalTaxableAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LineTotal { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.CreditNoteItem, CreditNoteItemDto>()
                .ForMember(d => d.Unit, opt => opt.Ignore())
                .ForMember(d => d.LineDiscountPercent, opt => opt.MapFrom(s =>
                    s.LineDiscountType == Novologs.Domain.Enums.DiscountType.Percentage
                        ? s.LineDiscountValue
                        : 0m));
        }
    }
}
