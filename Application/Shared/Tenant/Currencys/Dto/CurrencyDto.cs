using Novologs.Domain.Entities;

namespace Novologs.Application.Currencys.Dto;

public class CurrencyDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Currency, CurrencyDto>();
        }
    }
}
