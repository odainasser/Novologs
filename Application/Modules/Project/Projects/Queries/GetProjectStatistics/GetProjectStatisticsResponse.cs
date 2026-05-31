using Novologs.Application.Localizables.DTOs;
using Novologs.Application.User.Dto;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Queries.GetProjectStatistics;

public class GetProjectStatisticsResponse
{
    public long TaskCount { get; set; }
    public long BacklogTaskCount { get; set; }
    public List<TaskStatistics> TaskStatistics { get; set; } = new();
    public List<UsersStatistics> UsersStatistics { get; set; } = new();
}

public class UsersStatistics
{
    public TenantUserDto? User { get; set; }
    public bool IsMember { get; set; } = false;
    public bool IsOwner { get; set; } = false;
    public long TotalTaskCount { get; set; }
    public List<TaskStatistics> TaskStatistics { get; set; } = new();
}

public class TaskStatistics
{
    public TaskStatusDto? Status { get; set; }
    public long TaskCount { get; set; }
}

public class TaskStatusDto
{
    public ProjectTaskStatus Status { get; set; }
    public required LocalizableTextDto Name { get; set; }
    public string? Color { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TaskStatus, TaskStatusDto>();
        }
    }
}
