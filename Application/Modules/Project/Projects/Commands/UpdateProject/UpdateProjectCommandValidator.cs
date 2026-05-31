using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Projects.Commands.UpdateProject;

public class UpdateProjectCommandValidator : AbstractValidator<UpdateProjectCommand>
{
    private readonly ITenantDbContext _context;

    public UpdateProjectCommandValidator(ITenantDbContext context)
    {
        _context = context;
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");
        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (command, code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await _context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(d => d.Code == code && d.Id != command.Id, cancellationToken);
            }).WithMessage("Code must be unique.");


        RuleFor(v => v.Description)
            .MaximumLength(2048 * 4).WithMessage("Description must not exceed 8192 characters.");
        RuleFor(v => v.EndDate)
            .GreaterThan(v => v.StartDate).WithMessage("EndDate must be greater than StartDate.");
        RuleFor(v => v.DepartmentId)
            .MustAsync(async (departmentId, cancellationToken) =>
            {
                if (departmentId == null) return true;
                return await _context.GetSet<Department>()
                    .AnyAsync(d => d.Id == departmentId, cancellationToken);
            }).WithMessage("DepartmentId is not valid.");
        RuleFor(v => v.ClientId)
            .MustAsync(async (clientId, cancellationToken) =>
            {
                if (clientId == null) return true;
                return await _context.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(d => d.Id == clientId, cancellationToken);
            }).WithMessage("ClientId is not valid.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await _context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == id, cancellationToken);
            }).WithMessage("Project not found.");
        RuleFor(v => v.TaskTypeIds)
            .MustAsync(async (taskTypeIds, cancellationToken) =>
            {
                if (taskTypeIds == null || !taskTypeIds.Any())
                    return true;
                var distinctIds = taskTypeIds.Distinct().ToList();
                var existingCount = await _context
                    .GetSet<ProjectTaskType>()
                    .CountAsync(tt => distinctIds.Contains(tt.Id), cancellationToken);
                return existingCount == distinctIds.Count;
            })
            .WithMessage("One or more TaskTypeIds are invalid.");
        RuleFor(v => v.MemberList)
            .MustAsync(async (memberIds, cancellationToken) =>
            {
                if (memberIds == null || !memberIds.Any())
                    return true;

                var memberIdList = memberIds
                    .Select(m => m.MemberId)
                    .Distinct()
                    .ToList();

                var existingCount = await _context
                    .GetSet<TenantUser>()
                    .CountAsync(u => memberIdList.Contains(u.Id) && u.IsActive, cancellationToken);

                return existingCount == memberIdList.Count;
            })
            .WithMessage("One or more provided MemberIds are invalid or inactive.");

        //check for member duplication
        RuleFor(v => v.MemberList)
            .Must(memberList =>
            {
                if (memberList == null || !memberList.Any())
                    return true;

                var memberIds = memberList
                    .Select(m => m.MemberId)
                    .Distinct()
                    .ToList();

                return memberIds.Count == memberList.Count;
            })
            .WithMessage("Duplicate MemberIds found in MemberList.");

        RuleFor(v => v.ModuleList)
            .MustAsync(async (moduleList, cancellationToken) =>
            {
                if (moduleList == null || !moduleList.Any())
                    return true;

                var moduleIds = moduleList
                    .Select(m => m.Id)
                    .Distinct()
                    .ToList();

                var existingCount = await _context
                    .GetSet<ProjectModule>()
                    .CountAsync(pm => moduleIds.Contains(pm.Id), cancellationToken);

                return existingCount == moduleIds.Count;
            })
            .WithMessage("One or more provided ModuleIds are invalid.");
        RuleFor(v => v.LeadId)
            .MustAsync(async (leadId, cancellationToken) =>
            {
                if (leadId == null) return true;
                return await _context.GetSet<ClientLead>()
                    .AnyAsync(d => d.Id == leadId, cancellationToken);
            }).WithMessage("LeadId is not valid.");
        RuleFor(v => v.VendorId)
            .MustAsync(async (vendorId, cancellationToken) =>
            {
                if (vendorId == null) return true;
                return await _context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(d => d.Id == vendorId, cancellationToken);
            }).WithMessage("VendorId is not valid.");
        RuleFor(v => v.ContractId)
            .MustAsync(async (contractId, cancellationToken) =>
            {
                if (contractId == null) return true;
                return await _context.GetSet<VendorContract>()
                    .AnyAsync(d => d.Id == contractId, cancellationToken);
            }).WithMessage("ContractId is not valid.");
        RuleFor(v => v.GoalId)
            .MustAsync(async (goalId, cancellationToken) =>
            {
                if (goalId == null) return true;
                return await _context.GetSet<ProjectGoal>()
                    .AnyAsync(d => d.Id == goalId, cancellationToken);
            }).WithMessage("GoalId is not valid.");
        RuleFor(v => v.InitiativeId)
            .MustAsync(async (initiativeId, cancellationToken) =>
            {
                if (initiativeId == null) return true;
                return await _context.GetSet<ProjectInitiative>()
                    .AnyAsync(d => d.Id == initiativeId, cancellationToken);
            }).WithMessage("InitiativeId is not valid.");
        RuleFor(v => v.ModuleList)
            .Must(moduleList =>
            {
                if (moduleList == null || !moduleList.Any())
                    return true;

                var moduleIds = moduleList
                    .Select(m => m.Id)
                    .Distinct()
                    .ToList();

                return moduleIds.Count == moduleList.Count;
            })
            .WithMessage("Duplicate ModuleIds found in ModuleList.");

        RuleFor(v => v.Status)
            .IsInEnum().WithMessage("Invalid Project Status.")
            .When(v => v.Status != null);
        RuleFor(v => v.LifeCycle)
            .IsInEnum().WithMessage("Invalid Project Life Cycle.")
            .When(v => v.LifeCycle != null);
        RuleFor(v => v.OverviewDocumentId)
            .MustAsync(async (overviewDocumentId, cancellationToken) =>
            {
                if (overviewDocumentId == null) return true;
                return await _context.GetSet<DocumentNode>()
                    .AnyAsync(d => d.Id == overviewDocumentId, cancellationToken);
            }).WithMessage("OverviewDocumentId is not valid.");
    }
}
