using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Commands.SwapUserInHierarchy;

public class SwapUserInHierarchyCommandValidator : AbstractValidator<SwapUserInHierarchyCommand>
{
    public SwapUserInHierarchyCommandValidator(ITenantDbContext context)
    {
        //check if target and source nodes Ids are valid Id
        RuleFor(v => v.SourceNodeId)
            .NotEmpty().WithMessage("SourceNodeId is required.");
        RuleFor(v => v.TargetNodeId)
            .NotEmpty().WithMessage("TargetNodeId is required.");
        RuleFor(v => v.SourceNodeId)
            .NotEqual(v => v.TargetNodeId).WithMessage("SourceNodeId and TargetNodeId must be different.");
        RuleFor(v => v.SourceNodeId)
            .MustAsync(async (sourceNodeId, cancellationToken) =>
            {
                return await context.GetSet<OrganizationStructure>()
                    .AnyAsync(d => d.Id == sourceNodeId, cancellationToken);
            }).WithMessage("SourceNodeId is not valid.");
        RuleFor(v => v.TargetNodeId)
            .MustAsync(async (targetNodeId, cancellationToken) =>
            {
                return await context.GetSet<OrganizationStructure>()
                    .AnyAsync(d => d.Id == targetNodeId, cancellationToken);
            }).WithMessage("TargetNodeId is not valid.");
        //make sure the source node employee is not null
        RuleFor(v => v.SourceNodeId)
            .MustAsync(async (sourceNodeId, cancellationToken) =>
            {
                var sourceNode = await context.GetSet<OrganizationStructure>()
                    .FirstOrDefaultAsync(d => d.Id == sourceNodeId, cancellationToken);
                return sourceNode != null && sourceNode.EmployeeId != null;
            }).WithMessage("SourceNodeId must have an employee.");
        //make sure the destination node employee and department are both null
        RuleFor(v => v.TargetNodeId)
            .MustAsync(async (targetNodeId, cancellationToken) =>
            {
                var targetNode = await context.GetSet<OrganizationStructure>()
                    .FirstOrDefaultAsync(d => d.Id == targetNodeId, cancellationToken);
                return targetNode != null && targetNode.EmployeeId == null && targetNode.DepartmentId == null;
            }).WithMessage("TargetNodeId must be an empty node.");
    }
}
