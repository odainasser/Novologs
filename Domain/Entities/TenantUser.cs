using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TenantUser : IdentityUser<Guid>, ISoftDeletable, ICodeAndSerialEntity, IBaseAuditableEntity
{
    public TenantUser()
    {
        Id = Guid.NewGuid();
    }

    [MaxLength(200)] public string? Code { get; set; }
    public long Serial { get; set; }

    public bool IsActive { get; set; } = true;

    public string FullName { get; set; } = null!;

    public string Country { get; set; } = null!;

    public string Language { get; set; } = "en";

    //TODO move to UserInfo
    public decimal HourlyRate { get; set; } = 0;

    //TODO: remove usertype, use role instead
    public UserType UserType { get; set; } = UserType.Internal;

    public Guid? DesignationId { get; set; }
    [ForeignKey(nameof(DesignationId))] public Designation? Designation { get; set; }

    public Guid? DepartmentId { get; set; }
    [ForeignKey(nameof(DepartmentId))] public Department? Department { get; set; }

    public Guid? ProfileImageFileId { get; set; }

    [ForeignKey(nameof(ProfileImageFileId))]
    public Folder? ProfileImageFile { get; set; }

    public Guid? FolderId { get; set; }
    [ForeignKey(nameof(FolderId))] public Folder? Folder { get; set; }
 
    public Guid? CompanyBranchId { get; set; }
    [ForeignKey(nameof(CompanyBranchId))] public CompanyBranch? CompanyBranch { get; set; }
    
    public int TaskLevelElveator { get; set; } = 0;

    public ICollection<UserWorkStatus> UserWorkStatuses { get; set; } = new HashSet<UserWorkStatus>();

    public ICollection<ProjectMember> MemberProjects { get; set; } = new HashSet<ProjectMember>();

    public List<ProjectTaskMember> MemeberTasks { get; set; } = new();

    public List<UserLoginInfo> UserLoginInfos { get; set; } = new();

    public bool IsDeleted { get; set; }
    public DateTime? DeletedOnDate { get; set; }
    public string? DeletedBy { get; set; }

    public DateTimeOffset Created { get; set; } = DateTimeOffset.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }
}
