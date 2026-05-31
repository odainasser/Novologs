using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.DTOs;

public class ProductLookupDto
{
    public int Id { get; set; }
    public LocalizableTextDto Name { get; set; } = default!;
    public string? Unit { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Product, ProductLookupDto>();
        }
    }
}
