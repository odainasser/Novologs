using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.Priorities.Dto;

public class TaskPriorityDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TaskPriority, TaskPriorityDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }

}
