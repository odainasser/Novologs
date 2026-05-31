using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class DocumentNode(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public DocumentNode() : this(Guid.NewGuid()) { }

    public string? Code { get; set; }
    public long Serial { get; set; }

    public string? CurrentVersion { get; set; }
    public DocumentNodeVisibility Visibiltiy { get; set; } = DocumentNodeVisibility.Private;
    public DocumentNodeType Type { get; set; } = DocumentNodeType.Post;
    public DocumentNodeStatus Status { get; set; } = DocumentNodeStatus.Unpublished;

    public Guid? CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }

    public Guid? ParentNodeId { get; set; }
    [ForeignKey(nameof(ParentNodeId))] public DocumentNode? ParentNode { get; set; }

    public Guid? DocumentCategoryId { get; set; }

    [ForeignKey(nameof(DocumentCategoryId))]
    public DocumentCategory? DocumentCategory { get; set; }

    public Guid? FolderId { get; set; }
    [ForeignKey(nameof(FolderId))] public Folder? Folder { get; set; }

    public Guid? CommentThreadId { get; set; }
    [ForeignKey(nameof(CommentThreadId))] public CommentThread? CommentThread { get; set; }


    public List<DocumentNodeMember> Members { get; set; } = new();
    public List<DocumentVersion> DocumentVersionList { get; set; } = new();
    public List<DocumentNode> ChildrenNodes { get; set; } = new();

    public Guid? TaskId { get; set; }
    [ForeignKey(nameof(TaskId))] public ProjectTask? Task { get; set; }
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
}
