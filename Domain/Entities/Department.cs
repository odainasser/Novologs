using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Department(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    
    public Department() : this(Guid.NewGuid()) { }
    public Guid? ParentDepartmentId { get; set; }

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }

    [ForeignKey(nameof(ParentDepartmentId))]
    public Department? ParentDepartment { get; set; }


    public ICollection<Department> ChildDepartments { get; set; } = new HashSet<Department>();

    public ICollection<TenantUser> Employees { get; set; } = new HashSet<TenantUser>();
}
