using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class UserGroup(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public UserGroup() : this(Guid.NewGuid()) { }

    public string? Code { get; set; }
    public long Serial { get; set; }
    public string Name { get; set; } = null!;
      
    public Guid? CreatorUserId { get; set; }
    [ForeignKey(nameof(CreatorUserId))] public TenantUser? CreatorUser { get; set; }

    public List<UserGroupMember> Members { get; set; } = new();
}

public class UserGroupMember(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public UserGroupMember() : this(Guid.NewGuid()) { }

    public Guid UserGroupId { get; set; }
    [ForeignKey(nameof(UserGroupId))] public UserGroup? UserGroup { get; set; }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser? User { get; set; }
}


public class SalesTarget(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public SalesTarget() : this(Guid.NewGuid()) { }

    public DateTime Date { get; set; }
    public decimal Value { get; set; }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser? User { get; set; }
}
