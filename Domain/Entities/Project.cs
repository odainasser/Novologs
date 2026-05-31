using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Project(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public Project() : this(Guid.NewGuid()) { }
    
    public ProjectType Type { get; set; } = ProjectType.Mission; 

    public ProjectStatus Status { get; set; }
    public ProjectLifeCycle LifeCycle { get; set; }

    [MaxLength(200)] public string? Code { get; set; } = null!;
    public long Serial { get; set; }

    [MaxLength(2048)] public string Name { get; set; } = null!;

    [MaxLength(2048 * 4)] public string Description { get; set; } = null!;
    
    public Guid? OverviewDocumentId { get; set; }
    [ForeignKey(nameof(OverviewDocumentId))] public DocumentNode? OverviewDocument { get; set; }
    
    [MaxLength(50)] public string? Color { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public Guid CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }

    public Guid? DepartmentId { get; set; }
    [ForeignKey(nameof(DepartmentId))] public Department? Department { get; set; }

    public Guid? ClientId { get; set; }
    [ForeignKey(nameof(ClientId))] public Client? Client { get; set; }

    public Guid? GoalId { get; set; }
    [ForeignKey(nameof(GoalId))] public ProjectGoal? Goal { get; set; }

    public Guid? InitiativeId { get; set; }
    [ForeignKey(nameof(InitiativeId))] public ProjectInitiative? Initiative { get; set; }

    public Guid? DocumentId { get; set; }
    [ForeignKey(nameof(DocumentId))] public DocumentNode? Document { get; set; }

    public List<ProjectMember> ProjectMembers { get; set; } = new();
    public List<ProjectTaskTypeProject> TaskTypes { get; set; } = new();
    public List<ProjectModule> Modules { get; set; } = new();
    public List<ProjectMileStone> MileStones { get; set; } = new();
    public List<ProjectTask> Tasks { get; set; } = new();
}
