using Novologs.Domain.Entities;

namespace Novologs.Application.Localizables.DTOs;

public class LocalizedStringDto
{
    public Guid? Id { get; set; }

    public string Language { get; set; } = "en";

    public string Value { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<LocalizedStringDto, LocalizedString>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id ?? Guid.NewGuid()))
                ;
            CreateMap<LocalizedString, LocalizedStringDto>();
        }
    }
}

public class LocalizedStringInputDto
{
    public Guid? Id { get; set; }

    public string Language { get; set; } = "en";

    public string Value { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<LocalizedStringInputDto, LocalizedString>().ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id ?? Guid.NewGuid()));
        }
    }
}
