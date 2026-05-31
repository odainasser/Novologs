using Novologs.Application.Common.Interfaces;
using Novologs.Application.Hierarchy.Utilities;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.CreateTask;

public class CreateTaskCommandValidator : AbstractValidator<CreateTaskCommand>
{
    private readonly ITenantDbContext _dbContext;
    private readonly IUser _user;

    public CreateTaskCommandValidator(ITenantDbContext dbContext, IUser user)
    {
        _dbContext = dbContext;
        _user = user;

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await _dbContext.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(d => d.Code == code, cancellationToken);
            }).WithMessage("Code must be unique.");
        RuleFor(v => v.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
            {
                if (projectId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(d => d.Id == projectId, cancellationToken);
            }).WithMessage("ProjectId is not valid.");
        RuleFor(v => v.MileStoneId)
            .MustAsync(async (mileStoneId, cancellationToken) =>
            {
                if (mileStoneId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .AnyAsync(d => d.Id == mileStoneId, cancellationToken);
            }).WithMessage("MileStoneId is not valid.");
        RuleFor(v => v.ClientId)
            .MustAsync(async (clientId, cancellationToken) =>
            {
                if (clientId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(d => d.Id == clientId, cancellationToken);
            }).WithMessage("ClientId is not valid.");
        RuleFor(v => v.ClientLeadId)
            .MustAsync(async (clientLeadId, cancellationToken) =>
            {
                if (clientLeadId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(d => d.Id == clientLeadId, cancellationToken);
            }).WithMessage("ClientLeadId is not valid.");
        RuleFor(v => v.VendorId)
            .MustAsync(async (vendorId, cancellationToken) =>
            {
                if (vendorId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(d => d.Id == vendorId, cancellationToken);
            }).WithMessage("VendorId is not valid.");
        RuleFor(v => v.VendorContractId)
            .MustAsync(async (vendorContractId, cancellationToken) =>
            {
                if (vendorContractId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .AnyAsync(d => d.Id == vendorContractId, cancellationToken);
            }).WithMessage("VendorContractId is not valid.");
        RuleFor(v => v.DocumentId)
            .MustAsync(async (documentId, cancellationToken) =>
            {
                if (documentId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .AnyAsync(d => d.Id == documentId, cancellationToken);
            }).WithMessage("DocumentId is not valid.");

        RuleFor(v => v.CategoryId)
            .MustAsync(async (categoryId, cancellationToken) =>
            {
                if (categoryId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.TaskCategory>()
                    .AnyAsync(d => d.Id == categoryId, cancellationToken);
            }).WithMessage("CategoryId is not valid.");
        RuleFor(v => v.PriorityId)
            .MustAsync(async (priorityId, cancellationToken) =>
            {
                if (priorityId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.TaskPriority>()
                    .AnyAsync(d => d.Id == priorityId, cancellationToken);
            }).WithMessage("PriorityId is not valid.");
        RuleFor(v => v.ParentTaskId)
            .MustAsync(async (parentTaskId, cancellationToken) =>
            {
                if (parentTaskId == null) return true;
                return await _dbContext.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(d => d.Id == parentTaskId, cancellationToken);
            }).WithMessage("ParentTaskId is not valid.");
        RuleForEach(v => v.MembersIds)
            .MustAsync(async (memberId, cancellationToken) =>
            {
                return await _dbContext.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .AnyAsync(d => d.Id == memberId && d.IsActive, cancellationToken);
            }).WithMessage("MemberId is not valid.");

        When(v => v.AudioFileId == null, () =>
        {
            RuleFor(v => v.Description)
                .MinimumLength(3).WithMessage("Description must be at least 3 characters.");
        });

        RuleFor(v => v.StartDate)
            .LessThan(v => v.EndDate).WithMessage("Start date must be before end date.");
        
        RuleFor(v => v.MembersIds)
            .Must(members => members == null || members.Distinct().Count() == members.Count)
            .WithMessage("Duplicate members are not allowed.");

        //TODO dont create tasks to people with "no assign task" permission.
    }
}
