using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Finance.ItemCosts.Queries.GetItemCost;

public class GetItemCostQueryValidator : AbstractValidator<GetItemCostQuery>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetItemCostQueryValidator(ITenantDbContext context, IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;

        var currentUserId = Guid.Parse(_user.Id!);

        RuleFor(v => v)
            .Must(v => (short)v.CreatFilter < 4 || v.ControlEntity != TaskControlEntity.None || v.MyEmployee == true ||
                       (v.UserIds != null && v.UserIds.Any()))
            .WithMessage(
                "At least one filter  must be specified:  " +
                "CreatFilter is in (Created=0, Assigned=1, CreatedAndAssigned=2, Backlog=3, All=4)," +
                " or ControlEntity is in (ParentTask=1, Project=2, Milestone=3, Client=4, ClientLead=5, Vendor=6, VendorContract=7)," +
                " or MyEmployee or UserIds.");


        RuleFor(v => v.ControlEntityId)
            .MustAsync(async (context, controlEntityId, cancellationToken) =>
            {
                if (controlEntityId == null || context.ControlEntity == TaskControlEntity.None) return true;

                switch (context.ControlEntity)
                {
                    case TaskControlEntity.ParentTask:
                        return await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.Project:
                        return await _context.GetSet<Novologs.Domain.Entities.Project>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.Milestone:
                        return await _context.GetSet<ProjectMileStone>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.Client:
                        return await _context.GetSet<Novologs.Domain.Entities.Client>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.ClientLead:
                        return await _context.GetSet<ClientLead>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.Vendor:
                        return await _context.GetSet<Novologs.Domain.Entities.Vendor>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.VendorContract:
                        return await _context.GetSet<VendorContract>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    default:
                        return false;
                }
            }).WithMessage("ControlEntityId is not valid.");

        // if project selected the current user should be project owner 
        RuleFor(v => new { v.ControlEntity, v.ControlEntityId })
            .MustAsync(async (context, cancellationToken) =>
            {
                if (context.ControlEntity != TaskControlEntity.Project || context.ControlEntityId == null) return true;

                var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
                    .Include(p => p.ProjectMembers)
                    .FirstOrDefaultAsync(p => p.Id == context.ControlEntityId, cancellationToken);

                // allow for users with "view all project" permission 
                var hasPermission = await _userManager.HasPermissionAsync(_context, currentUserId,
                    Novologs.Domain.Constants.Permissions.Projects.ViewAll) || await _userManager.HasPermissionAsync(_context, currentUserId, Novologs.Domain.Constants.Permissions.General.ViewAll);
                if (hasPermission) return true;

                return project?.ProjectMembers.Any(m => m.MemberId == currentUserId) == true;
            }).WithMessage("Can't view tasks for project you are not an Owner of.");

        RuleFor(v => v.StatusIds)
            .MustAsync(async (statusIds, cancellationToken) =>
            {
                if (statusIds == null || !statusIds.Any()) return true;

                return await _context.GetSet<Novologs.Domain.Entities.TaskStatus>()
                    .AnyAsync(d => statusIds.Contains(d.Id), cancellationToken);
            }).WithMessage("StatusIds is not valid.");

        RuleFor(v => v.CategoryId)
            .MustAsync(async (categoryIds, cancellationToken) =>
            {
                if (categoryIds == null || !categoryIds.Any()) return true;

                return await _context.GetSet<TaskCategory>()
                    .AnyAsync(d => categoryIds.Contains(d.Id), cancellationToken);
            }).WithMessage("CategoryId is not valid.");

        RuleFor(v => v.PriorityId)
            .MustAsync(async (priorityIds, cancellationToken) =>
            {
                if (priorityIds == null || !priorityIds.Any()) return true;

                return await _context.GetSet<TaskPriority>()
                    .AnyAsync(d => priorityIds.Contains(d.Id), cancellationToken);
            }).WithMessage("PriorityId is not valid.");
    }
}
