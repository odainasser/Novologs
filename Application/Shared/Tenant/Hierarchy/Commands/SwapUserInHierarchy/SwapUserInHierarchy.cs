using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Commands.SwapUserInHierarchy;

public record SwapUserInHierarchyCommand : IRequest<Result<SwapUserInHierarchyResponse>>
{
    public Guid SourceNodeId { get; set; }
    public Guid TargetNodeId { get; set; }
}

public class SwapUserInHierarchyResponse
{
}

public class
    SwapUserInHierarchyCommandHandler : IRequestHandler<SwapUserInHierarchyCommand, Result<SwapUserInHierarchyResponse>>
{
    private readonly ITenantDbContext _context;

    public SwapUserInHierarchyCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SwapUserInHierarchyResponse>> Handle(SwapUserInHierarchyCommand request,
        CancellationToken cancellationToken)
    {
        var allHirarchy = await _context.GetSet<OrganizationStructure>()
            .Include(h => h.Children)
            .ToListAsync(cancellationToken);
        //swap source nide with destination node employees
        var sourceNode = allHirarchy.FirstOrDefault(d => d.Id == request.SourceNodeId);
        var targetNode = allHirarchy.FirstOrDefault(d => d.Id == request.TargetNodeId);

        if (sourceNode == null || targetNode == null)
        {
            return Result<SwapUserInHierarchyResponse>.Failure(new[]
            {
                new ErrorItem("Hierarchy_001", "Source or Target node not found")
            });
        }

        var employeeId = sourceNode.EmployeeId;
        sourceNode.EmployeeId = null;
        targetNode.EmployeeId = employeeId;
        await _context.SaveChangesAsync(cancellationToken);

        //check if all parents of the source node are empty nodes (employee=null, departemnet == null) then delete the node (mark as deleted)  
        var nodeToCheck = sourceNode; 
        HierarchUtil.ClearHierarchyParent(nodeToCheck);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<SwapUserInHierarchyResponse>.Success(new SwapUserInHierarchyResponse());
    } 
}
