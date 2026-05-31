using Novologs.Application.User.Dto;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Dto;

public class ProjectDto
{
    public Guid? Id { get; set; }
    public ProjectType Type { get; set; }
    
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

    public Guid? ClientId { get; set; }
    public ClientDto? Client { get; set; }

    public Guid? GoalId { get; set; }
    public ProjectGoalDto? Goal { get; set; }

    public Guid? InitiativeId { get; set; }
    public ProjectInitiativeDto? Initiative { get; set; }

    public List<ProjectMemberDto> ProjectMembers { get; set; } = new();
    public List<ProjectMileStoneDto> MileStones { get; set; } = new();
    public List<ProjectTaskTypeDto> TaskTypes { get; set; } = new();
    public List<ProjectModuleDto> Modules { get; set; } = new();

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }
    public Guid? RootFolderId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Project, ProjectDto>();
        }
    }
}
