using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Client.Leads.Dto;

public class LeadSourceDto
{
    public Guid? Id { get; set; }
    public Guid NameId { get; set; }
    public LocalizableTextDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.LeadSource, LeadSourceDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}
