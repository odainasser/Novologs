using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Categories.Queries.GetProjectCategory;

public class ProjectTaskCategoryDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!; 
    
    public List<TaskStatistic> TotalTasksByStatus { get; set; } = new();

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TaskCategory, ProjectTaskCategoryDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class TaskStatistic
{
    public ProjectTaskStatusDto Status { get; set; } = null!;
    public int Count { get; set; }
}

public class ProjectTaskStatusDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    public ProjectTaskStatus Status { get; set; }
    public string? Color { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TaskStatus, ProjectTaskStatusDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}
