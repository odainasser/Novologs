using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Client.Leads.Dto;

public class LeadSaleStatusDto
{
    public Guid? Id { get; set; }
    public Guid NameId { get; set; }
    public LocalizableTextDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.LeadSaleStatus, LeadSaleStatusDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}
