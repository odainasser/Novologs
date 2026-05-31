using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Commands.DeleteUserFromHierarchy;

public record DeleteNodeFromHierarchyCommand : IRequest<Result<DeleteNodeFromHierarchyResponse>>
{
    public Guid nodeToDeleteId { get; set; }
}

public class DeleteNodeFromHierarchyResponse
{
}

public class
    DeleteNodeFromHierarchyCommandHandler : IRequestHandler<DeleteNodeFromHierarchyCommand,
    Result<DeleteNodeFromHierarchyResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteNodeFromHierarchyCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteNodeFromHierarchyResponse>> Handle(DeleteNodeFromHierarchyCommand request,
        CancellationToken cancellationToken)
    {
        var allHirarchy = await _context.GetSet<OrganizationStructure>()
            .Include(h => h.Children)
            .ToListAsync(cancellationToken);
        //remove the employee from the to-delete node and insert the employee in new node under department "General" node
        var nodeToDelete = allHirarchy.FirstOrDefault(d => d.Id == request.nodeToDeleteId);

        var generalDepartment = await _context.GetSet<Domain.Entities.Department>()
            .FirstOrDefaultAsync(d => d.Name.Value == "General", cancellationToken);

        var generalDepartmentNode = allHirarchy.FirstOrDefault(d => d.DepartmentId == generalDepartment!.Id);

        var newNode = new OrganizationStructure(Guid.NewGuid())
        {
            ParentStructureId = generalDepartmentNode!.Id, EmployeeId = nodeToDelete!.EmployeeId
        };
        await _context.GetSet<OrganizationStructure>().AddAsync(newNode, cancellationToken);
        nodeToDelete.EmployeeId = null;
        //check if all parents of the source node are empty nodes (employee=null, department == null) then delete the node (mark as deleted)  
        var nodeToCheck = nodeToDelete;
        HierarchUtil.ClearHierarchyParent(nodeToCheck);

        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteNodeFromHierarchyResponse>.Success(new DeleteNodeFromHierarchyResponse());
    }
}
