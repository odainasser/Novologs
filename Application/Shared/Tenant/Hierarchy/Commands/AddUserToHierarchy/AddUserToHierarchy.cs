using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Commands.AddUserToHierarchy;

public record AddUserToHierarchyCommand : IRequest<Result<AddUserToHierarchyResponse>>
{
    public Guid NodeToInsertId { get; set; }
    public Guid DestinationParentNodeId { get; set; }
}

public class AddUserToHierarchyCommandValidator : AbstractValidator<AddUserToHierarchyCommand>
{
    public AddUserToHierarchyCommandValidator(ITenantDbContext context)
    {

        //check NodeToInsertId is a valid hierarchy and it's under the General department node
        RuleFor(v => v.NodeToInsertId)
            .NotEmpty().WithMessage("NodeToInsertId is required.");
        RuleFor(v => v.DestinationParentNodeId)
            .NotEmpty().WithMessage("DestinationParentNodeId is required.");
        RuleFor(v => v.NodeToInsertId)
            .MustAsync(async (nodeToInsertId, cancellationToken) =>
            {
                return await context.GetSet<OrganizationStructure>()
                    .AnyAsync(d => d.Id == nodeToInsertId, cancellationToken);
            }).WithMessage("NodeToInsertId is not valid.");
        RuleFor(v => v.DestinationParentNodeId)
            .MustAsync(async (destinationParentNodeId, cancellationToken) =>
            {
                return await context.GetSet<OrganizationStructure>()
                    .AnyAsync(d => d.Id == destinationParentNodeId, cancellationToken);
            }).WithMessage("DestinationParentNodeId is not valid.");
        RuleFor(v => v.NodeToInsertId)
            .MustAsync(async (nodeToInsertId, cancellationToken) =>
            {
                var node = await context.GetSet<OrganizationStructure>()
                    .Include(d => d.Department)
                    .FirstOrDefaultAsync(d => d.Id == nodeToInsertId, cancellationToken);

                //get general departement node, node parent should be general departemnt node
                var generalDepartmentNode = await context.GetSet<OrganizationStructure>()
                    .Include(d => d.Department)
                    .FirstOrDefaultAsync(d => d.Department != null && d.Department.Name.Value == "General",
                        cancellationToken);

                return node != null && node.ParentStructureId == generalDepartmentNode?.Id;
            }).WithMessage("NodeToInsertId must be under General department.");
        RuleFor(v => v.DestinationParentNodeId)
            .MustAsync(async (destinationParentNodeId, cancellationToken) =>
            {
                var node = await context.GetSet<OrganizationStructure>()
                    .Include(d => d.ParentStructure)
                    .Include(d => d.Department)
                    .FirstOrDefaultAsync(d => d.Id == destinationParentNodeId, cancellationToken);
                return node == null || node.ParentStructure?.Department?.Name.Value != "General";
            }).WithMessage("DestinationParentNodeId must not be under General department.");
        //prevent adding to top level (CEO), i.e. if destinationParent.parentId is null prevent adding (can't add to top level)
        RuleFor(v => v.DestinationParentNodeId)
            .MustAsync(async (destinationParentNodeId, cancellationToken) =>
            {
                var node = await context.GetSet<OrganizationStructure>()
                    .Include(d => d.ParentStructure)
                    .FirstOrDefaultAsync(d => d.Id == destinationParentNodeId, cancellationToken);
                return node?.ParentStructureId != null;
            }).WithMessage("Can't add to top level.");
    }
}

public class AddUserToHierarchyResponse
{
}

public class
    AddUserToHierarchyCommandHandler : IRequestHandler<AddUserToHierarchyCommand, Result<AddUserToHierarchyResponse>>
{
    private readonly ITenantDbContext _context;

    public AddUserToHierarchyCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AddUserToHierarchyResponse>> Handle(AddUserToHierarchyCommand request,
        CancellationToken cancellationToken)
    {
        var allHirarchy = await _context.GetSet<OrganizationStructure>()
            .Include(h => h.Children)
            .ToListAsync(cancellationToken);
        //remove the employee from NodeToInsertId and delete it if it has no children, then enter the employee as a child to node DestinationParentNodeId ,return empty responce
        var nodeToInsert = allHirarchy.FirstOrDefault(d => d.Id == request.NodeToInsertId);
        var destinationParentNode = allHirarchy.FirstOrDefault(d => d.Id == request.DestinationParentNodeId);

        if (nodeToInsert == null || destinationParentNode == null)
        {
            return Result<AddUserToHierarchyResponse>.Failure(new[]
            {
                new ErrorItem("Hierarchy_002", "NodeToInsert or DestinationParentNode not found")
            });
        }

        var newNode = new OrganizationStructure(Guid.NewGuid())
        {
            ParentStructureId = destinationParentNode.Id, EmployeeId = nodeToInsert.EmployeeId
        };
        await _context.GetSet<OrganizationStructure>().AddAsync(newNode, cancellationToken);
        nodeToInsert.EmployeeId = null;
        //check if all parents of the source node are empty nodes (employee=null, department == null) then delete the node (mark as deleted)  
        var nodeToCheck = nodeToInsert;
        HierarchUtil.ClearHierarchyParent(nodeToCheck);

        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddUserToHierarchyResponse>.Success(new AddUserToHierarchyResponse());
    }
}
