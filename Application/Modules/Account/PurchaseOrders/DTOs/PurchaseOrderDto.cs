using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.DTOs;

public class PurchaseOrderDto
{
    public int Id { get; set; }
    public string PoNumber { get; set; } = default!;
    public Guid VendorId { get; set; }
    public string Currency { get; set; } = default!;
    public string? BillingAddress { get; set; }
    public string? OrderType { get; set; }
    public string? Location { get; set; }
    public string? Terms { get; set; }
    public DateTime PurchaseDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? OurRef { get; set; }
    public string? YourRef { get; set; }
    public PurchaseOrderStatus Status { get; set; }
    public DiscountType OverallDiscountType { get; set; }
    public decimal OverallDiscountValue { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TotalLineDiscount { get; set; }
    public decimal SubtotalAfterLineDiscounts { get; set; }
    public decimal OverallDiscountAmount { get; set; }
    public decimal TotalTaxableAmount { get; set; }
    public decimal TotalTax { get; set; }
    public decimal GrandTotal { get; set; }
    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public string? MessageOnPurchase { get; set; }
    public List<PurchaseOrderItemDto> Items { get; set; } = new();
    public List<PurchaseOrderAttachmentDto> Attachments { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.PurchaseOrder, PurchaseOrderDto>();
            CreateMap<Novologs.Domain.Entities.PurchaseOrderItem, PurchaseOrderItemDto>()
                .ForMember(d => d.Product, opt => opt.Ignore())
                .ForMember(d => d.Unit,    opt => opt.Ignore());
        }
    }
}
