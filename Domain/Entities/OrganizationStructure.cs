using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class OrganizationStructure(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{    
    public OrganizationStructure() : this(Guid.NewGuid()) { }

    public Guid? ParentStructureId { get; set; }

    [ForeignKey(nameof(ParentStructureId))]
    public OrganizationStructure? ParentStructure { get; set; }

    public Guid? EmployeeId { get; set; }
    [ForeignKey(nameof(EmployeeId))] public TenantUser? Employee { get; set; }

    public Guid? DepartmentId { get; set; }
    [ForeignKey(nameof(DepartmentId))] public Department? Department { get; set; }

    public ICollection<OrganizationStructure> Children { get; set; } = new HashSet<OrganizationStructure>();
}
