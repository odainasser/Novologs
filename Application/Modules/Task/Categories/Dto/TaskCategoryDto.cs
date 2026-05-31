using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.Categories.Dto;

public class TaskCategoryDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;
    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TaskCategory, TaskCategoryDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }

}
