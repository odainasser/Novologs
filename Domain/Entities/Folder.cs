using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Contracts;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Folder(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public Folder() : this(Guid.NewGuid()) { }

    public FolderType Type { get; set; } = FolderType.Normal;
    public string Name { get; set; } = null!;
    public bool IsFile { get; set; } = false;
    public string? MimeType { get; set; }
    public long? Size { get; set; }
    public string? Url { get; set; }
    public string? Path { get; set; }

    public Guid? ParentFolderId { get; set; }
    [ForeignKey(nameof(ParentFolderId))] public Folder? ParentFolder { get; set; }

    public Guid CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }

    public Guid? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project? Project { get; set; }

    public Guid? MilestoneId { get; set; }
    [ForeignKey(nameof(MilestoneId))] public ProjectMileStone? Milestone { get; set; }

    public Guid? ClientId { get; set; }
    [ForeignKey(nameof(ClientId))] public Client? Client { get; set; }

    public Guid? LeadId { get; set; }
    [ForeignKey(nameof(LeadId))] public ClientLead? Lead { get; set; }

    public Guid? VendorId { get; set; }
    [ForeignKey(nameof(VendorId))] public Vendor? Vendor { get; set; }

    public Guid? ContractId { get; set; }
    [ForeignKey(nameof(ContractId))] public VendorContract? Contract { get; set; }

    public Guid? TaskId { get; set; }
    [ForeignKey(nameof(TaskId))] public ProjectTask? Task { get; set; }
    
    public Guid? MissionId { get; set; }
    [ForeignKey(nameof(MissionId))] public Project? Mission { get; set; }
    
    public Guid? ChatRoomId { get; set; }

    public Guid? DocumentNodeId { get; set; }

    public ICollection<Folder> Subfolders { get; set; } = new HashSet<Folder>();
    public ICollection<Share> Shares { get; set; } = new HashSet<Share>();
}
