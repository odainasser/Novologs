using Novologs.Application.Common.Interfaces;
using SystemLoaders.Services;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.UpdateTask;

public class UpdateTaskCommandValidator : AbstractValidator<UpdateTaskCommand>
{
    public UpdateTaskCommandValidator(
        ITenantDbContext context,
        IUser user
    )
    {

        // description should be more than 3 chars
        RuleFor(v => v.Description)
            .MinimumLength(3).WithMessage("Description must be at least 3 characters long.")
            .When(v => !string.IsNullOrEmpty(v.Description));

        //make sure Code is unique 
        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.");
        RuleFor(v => v.Code)
            .MustAsync(async (command, code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(command.Code)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(d => d.Code == code && d.Id != command.Id, cancellationToken);
            }).WithMessage("Code must be unique.");

        //make sure Ids are valid 
        RuleFor(v => v.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
            {
                if (projectId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(d => d.Id == projectId, cancellationToken);
            }).WithMessage("ProjectId is not valid.");

        RuleFor(v => v.MileStoneId)
            .MustAsync(async (mileStoneId, cancellationToken) =>
            {
                if (mileStoneId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .AnyAsync(d => d.Id == mileStoneId, cancellationToken);
            }).WithMessage("MileStoneId is not valid.");
        RuleFor(v => v.ClientId)
            .MustAsync(async (clientId, cancellationToken) =>
            {
                if (clientId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(d => d.Id == clientId, cancellationToken);
            }).WithMessage("ClientId is not valid.");
        RuleFor(v => v.ClientLeadId)
            .MustAsync(async (clientLeadId, cancellationToken) =>
            {
                if (clientLeadId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(d => d.Id == clientLeadId, cancellationToken);
            }).WithMessage("ClientLeadId is not valid.");
        RuleFor(v => v.VendorId)
            .MustAsync(async (vendorId, cancellationToken) =>
            {
                if (vendorId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(d => d.Id == vendorId, cancellationToken);
            }).WithMessage("VendorId is not valid.");
        RuleFor(v => v.VendorContractId)
            .MustAsync(async (vendorContractId, cancellationToken) =>
            {
                if (vendorContractId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .AnyAsync(d => d.Id == vendorContractId, cancellationToken);
            }).WithMessage("VendorContractId is not valid.");
        RuleFor(v => v.DocumentId)
            .MustAsync(async (documentId, cancellationToken) =>
            {
                if (documentId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .AnyAsync(d => d.Id == documentId, cancellationToken);
            }).WithMessage("DocumentId is not valid.");
        RuleFor(v => v.CategoryId)
            .MustAsync(async (categoryId, cancellationToken) =>
            {
                if (categoryId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.TaskCategory>()
                    .AnyAsync(d => d.Id == categoryId, cancellationToken);
            }).WithMessage("CategoryId is not valid.");
        RuleFor(v => v.PriorityId)
            .MustAsync(async (command, priorityId, cancellationToken) =>
            {
                if (priorityId == null) return true;
                // Allow the task's existing priority even if it has been soft-deleted
                var currentPriorityId = await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .Where(t => t.Id == command.Id)
                    .Select(t => t.PriorityId)
                    .FirstOrDefaultAsync(cancellationToken);
                if (currentPriorityId == priorityId) return true;
                return await context.GetSet<Novologs.Domain.Entities.TaskPriority>()
                    .AnyAsync(d => d.Id == priorityId, cancellationToken);
            }).WithMessage("PriorityId is not valid.");
        RuleFor(v => v.ParentTaskId)
            .MustAsync(async (parentTaskId, cancellationToken) =>
            {
                if (parentTaskId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(d => d.Id == parentTaskId, cancellationToken);
            }).WithMessage("ParentTaskId is not valid.");
        RuleForEach(v => v.MembersIds)
            .MustAsync(async (memberId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .AnyAsync(d => d.Id == memberId && d.IsActive, cancellationToken);
            }).WithMessage("MemberId is not valid.");

        RuleFor(v => v.MembersIds)
            .Must(members => members == null || members.Distinct().Count() == members.Count)
            .WithMessage("Duplicate members are not allowed.");

        //Make sure start date > end date
        RuleFor(v => v.StartDate)
            .LessThan(v => v.EndDate).WithMessage("Start date must be before end date.");
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(d => d.Id == id, cancellationToken);
            }).WithMessage("Id is not valid.");

        //prevent assigning ticket creator as a ticket member (lot of code for silly rule)
        RuleFor(v => v.MembersIds)
            .MustAsync(async (model, membersIds, cancellationToken) =>
            {
                if (membersIds == null || !membersIds.Any()) return true;

                var task = await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .Include(t => t.Project)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.Id == model.Id, cancellationToken);

                if (task == null) return true;
                if (task.ProjectId == null) return true;
                if (!membersIds.Contains(task.CreatorId)) return true;

                if (task == null) return true;
                if (membersIds.Contains(task.CreatorId) && task.Project!.Type == ProjectType.Ticketing)
                {
                    return false;
                }

                return true;
            })
            .WithMessage("The task creator cannot be assigned as a member.");
    }
}
