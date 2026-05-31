using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectTask(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public ProjectTask() : this(Guid.NewGuid()) { }

    [MaxLength(200)] public string? Code { get; set; } = null!;
    public long Serial { get; set; }

    public Guid CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }

    public bool IsConfidential { get; set; }
    public bool IsAssignedToMe { get; set; }

    [MaxLength(4096 * 4)] public string? Description { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }

    public Guid? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project? Project { get; set; }

    public Guid? MileStoneId { get; set; }
    [ForeignKey(nameof(MileStoneId))] public ProjectMileStone? MileStone { get; set; }

    public Guid? ClientId { get; set; }
    [ForeignKey(nameof(ClientId))] public Client? Client { get; set; }

    public Guid? ClientLeadId { get; set; }
    [ForeignKey(nameof(ClientLeadId))] public ClientLead? ClientLead { get; set; }

    public Guid? VendorId { get; set; }
    [ForeignKey(nameof(VendorId))] public Vendor? Vendor { get; set; }

    public Guid? VendorContractId { get; set; }
    [ForeignKey(nameof(VendorContractId))] public VendorContract? VendorContract { get; set; }
    public Guid? DocumentId { get; set; }
    [ForeignKey(nameof(DocumentId))] public DocumentNode? Document { get; set; }


    public Guid StatusId { get; set; }
    [ForeignKey(nameof(StatusId))] public TaskStatus? Status { get; set; }

    public Guid? CategoryId { get; set; }
    [ForeignKey(nameof(CategoryId))] public TaskCategory? Category { get; set; }

    public Guid? PriorityId { get; set; }
    [ForeignKey(nameof(PriorityId))] public TaskPriority? Priority { get; set; }

    public Guid? ParentTaskId { get; set; }
    [ForeignKey(nameof(ParentTaskId))] public ProjectTask? ParentTask { get; set; }

    public Guid? CommentThreadId { get; set; }
    [ForeignKey(nameof(CommentThreadId))] public CommentThread? CommentThread { get; set; }

    public Guid? AudioFileId { get; set; }
    [ForeignKey(nameof(AudioFileId))] public Folder? AudioFile { get; set; }

    public List<ProjectTask> ChildTasks { get; set; } = new();

    public List<ProjectTaskMember> Members { get; set; } = new();

    public List<ChatMessageTask> ChatMessages { get; set; } = new();

    public List<TodoItem> TodoItems { get; set; } = new();

    public List<TimeSheet> TimeSheets { get; set; } = new();

    public List<ProjectTaskTimeLine> TimeLines { get; set; } = new();
}
