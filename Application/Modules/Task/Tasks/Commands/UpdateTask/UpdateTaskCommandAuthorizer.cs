using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Modules.Tasks.Tasks.Commands.UpdateTask;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.UpdateTask;

public class UpdateTaskCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateTaskCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateTaskCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<UpdateTaskCommand> requirement)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            context.Fail(new AuthorizationFailureReason(this, "User ID is invalid."));
            return;
        }

        var user = await _context.GetSet<TenantUser>().AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == _user.IdGuid);
        if (user == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Current user not found."));
            return;
        }

        var task = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .Include(d => d.Members)
            .Include(t => t.Project)
            .ThenInclude(p => p!.ProjectMembers)
            .FirstOrDefaultAsync(t => t.Id == requirement.Request!.Id);

        if (task == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Task not found."));
            return;
        }

        var isCreator = task.CreatorId == userId;
        var hasUpdatePermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Tasks.UpdateTask);

        var isTicketingProject = task.Project?.Type == ProjectType.Ticketing;
        var isProjectMember = task.Project?.ProjectMembers.Any(pm => pm.MemberId == userId) ?? false;

        //if task is not ticketing task, then only creator can update, if ticketing then only project members or ticket(task) creator can update
        if (isTicketingProject)
        {
            if (!isCreator && !isProjectMember)
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "Only project members or the task creator can update ticketing tasks."));
                return;
            }
        }
        else // Not a ticketing project
        {
            if (!isCreator && !hasUpdatePermission)
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "Only the task creator or users with 'Update Task' permission can update this task."));
                return;
            }
        }

        //if any of task members (other than current user) hase DontAssignTasks permission then fail
        if (requirement.Request!.MembersIds.Any())
        {
            var existingMemberIds = task.Members.Select(m => m.MemberId).ToHashSet();
            var newMemberIds = requirement.Request.MembersIds
                .Where(id => id.HasValue && !existingMemberIds.Contains(id.Value))
                .Select(id => id!.Value)
                .ToList();

            if (newMemberIds.Any())
            {
                var newMembers = await _context.GetSet<TenantUser>()
                    .AsNoTracking()
                    .Where(u => newMemberIds.Contains(u.Id))
                    .ToListAsync();

                foreach (var member in newMembers)
                {
                    if (await _userManager.HasPermissionAsync(_context, member.Id,
                            Novologs.Domain.Constants.Permissions.Tasks.DontAssignTasks))
                    {
                        context.Fail(new AuthorizationFailureReason(this,
                            $"User {member.FullName} cannot be assigned tasks."));
                        return;
                    }
                }
            }
        }


        var organizationStructure = await _context.GetSet<OrganizationStructure>()
            .Include(d => d.Children)
            .AsSingleQuery().AsNoTracking()
            .ToListAsync();


        var taskLevelElveator = 0;
        if (await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                Novologs.Domain.Constants.Permissions.Tasks.HasTaskLevelElevator))
        {
            taskLevelElveator = user?.TaskLevelElveator ?? 0;
        }

        var allVisibleUsersIds =
            HierarchUtil.GetTaskAvailableMembers(organizationStructure, _user.IdGuid, taskLevelElveator);

        if (requirement.Request.MembersIds.Any(memberId => !allVisibleUsersIds.Contains(memberId!.Value)))
        {
            context.Fail(new AuthorizationFailureReason(this,
                "One or more assigned members are not within your visible hierarchy or cannot be assigned tasks."));
            return;
        }

        context.Succeed(requirement);
    }
}
