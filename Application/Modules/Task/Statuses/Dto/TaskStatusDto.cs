using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Statuses.Dto;

public class TaskStatusDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    public ProjectTaskStatus Status { get; set; }
    public string? Color { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TaskStatus, TaskStatusDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}
