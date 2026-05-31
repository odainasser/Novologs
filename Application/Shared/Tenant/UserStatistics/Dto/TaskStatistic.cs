using Novologs.Application.Departments.Queries.GetDepartment;
using Novologs.Application.Localizables.DTOs;
using Novologs.Application.User.Dto;
using Novologs.Domain.Enums;

namespace Novologs.Application.UserStatistics.Dto;

public class TaskStatistic
{
    public TaskStatusDto Status { get; set; } = null!;
    public int Count { get; set; }
}

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
            CreateMap<Domain.Entities.TaskStatus, TaskStatusDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class ProjectStatistic
{
    public ProjectDto Project { get; set; } = null!;
    public List<TaskStatistic> TotalTasksByStatus { get; set; } = new();
}

public class ProjectDto
{
    public Guid? Id { get; set; }
    public ProjectType Type { get; set; } = ProjectType.Mission;

    public ProjectStatus Status { get; set; }
    public ProjectLifeCycle LifeCycle { get; set; }

    public string? Code { get; set; }
    public long Serial { get; set; }

    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Guid? OverviewDocumentId { get; set; }

    public string? Color { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public Guid CreatorId { get; set; }
    public TenantUserDto? Creator { get; set; }

    public Guid? DepartmentId { get; set; }
    public DepartmentDto? Department { get; set; }

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }
    public Guid? RootFolderId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.Project, ProjectDto>();
        }
    }
}
