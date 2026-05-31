using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Commands.DeleteUserFromHierarchy;

public class DeleteUserFromHierarchyCommandValidator : AbstractValidator<DeleteNodeFromHierarchyCommand>
{
    public DeleteUserFromHierarchyCommandValidator(ITenantDbContext context)
    {
        //check if nodeToDeleteId is valid Id and contain employee and not under Gereral department
        RuleFor(v => v.nodeToDeleteId)
            .NotEmpty().WithMessage("nodeToDeleteId is required.");
        RuleFor(v => v.nodeToDeleteId)
            .MustAsync(async (nodeToDeleteId, cancellationToken) =>
            {
                return await context.GetSet<OrganizationStructure>()
                    .AnyAsync(d => d.Id == nodeToDeleteId, cancellationToken);
            }).WithMessage("nodeToDeleteId is not valid."); 
        RuleFor(v => v.nodeToDeleteId)
            .MustAsync(async (nodeToDeleteId, cancellationToken) =>
            {
                var node = await context.GetSet<OrganizationStructure>()
                    .Include(d => d.Department) 
                    .FirstOrDefaultAsync(d => d.Id == nodeToDeleteId && 
                                              d.Department!=null &&
                                              (d.Department.Name.Value != "General" ||
                                               d.Department.Name.Value != "Admin" )
                        , cancellationToken);
                return node == null ;
            }).WithMessage("nodeToDeleteId can not be under General department.");
    }
}
