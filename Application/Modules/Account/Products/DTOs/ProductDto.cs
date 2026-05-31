using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public LocalizableTextDto Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? Unit { get; set; }
    public decimal? TaxPercentage { get; set; }
    public bool IsActive { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Product, ProductDto>();
        }
    }
}
