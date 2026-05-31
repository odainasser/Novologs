using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.DTOs;

public class ProductUnitDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = default!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProductUnit, ProductUnitDto>();
        }
    }
}
