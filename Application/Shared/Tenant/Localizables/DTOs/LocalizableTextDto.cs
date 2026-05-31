using Novologs.Domain.Entities;

namespace Novologs.Application.Localizables.DTOs;

public class LocalizableTextDto
{
    public Guid? Id { get; set; }
    public string Value { get; set; } = null!;

    public ICollection<LocalizedStringDto> LocalizedStrings { get; set; } = new HashSet<LocalizedStringDto>(); 
    
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<LocalizableTextDto, LocalizableText>();
            CreateMap<LocalizableText, LocalizableTextDto>();
        }
    }
}

public class LocalizableTextInputDto
{
    public Guid? Id { get; set; }
    public string Value { get; set; } = null!;

    public ICollection<LocalizedStringInputDto> LocalizedStrings { get; set; } = new HashSet<LocalizedStringInputDto>();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<LocalizableTextInputDto, LocalizableText>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id ?? Guid.NewGuid()))
                ;
            CreateMap<LocalizableText, LocalizableTextInputDto>();
        }
    }
}
