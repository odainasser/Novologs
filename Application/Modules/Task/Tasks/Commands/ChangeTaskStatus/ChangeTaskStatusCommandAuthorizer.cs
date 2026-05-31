using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.ChangeTaskStatus;

public class ChangeTaskStatusCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ChangeTaskStatusCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IUser _user;

    public ChangeTaskStatusCommandAuthorizer(
        ITenantDbContext context,
        UserManager<TenantUser> userManager, 
        IUser user)
    {
        _context = context;
        _userManager = userManager;
        _user = user;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<ChangeTaskStatusCommand> requirement)
    { 
        if (_user.IdGuid == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "User not found."));
            return;
        } 
        var changerId = _user.IdGuid.Value;
        
        var task = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .Include(t => t.Members)
            .Include(t => t.Project).ThenInclude(p => p!.ProjectMembers)
            .AsNoTracking().AsSplitQuery()
            .FirstOrDefaultAsync(t => t.Id == requirement.Request!.TaskId);

        if (task == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Task not found."));
            return;
        }

        var changeeId = requirement.Request!.UserId ?? changerId;
        var isChangingOwnStatus = !requirement.Request!.UserId.HasValue ||
                                  requirement.Request!.UserId.Value == changerId;

        var isCreator = task.CreatorId == changerId;
        var isTaskMember = task.Members.Any(m => m.MemberId == changerId);
        var isTicketingProject = task.Project?.Type == ProjectType.Ticketing;
        var isProjectMember = task.Project?.ProjectMembers.Any(pm => pm.MemberId == changerId) ?? false;
        var updateTaskPermission = await _userManager.HasPermissionAsync(_context, changerId,
            Novologs.Domain.Constants.Permissions.Tasks.UpdateTask);

        if (isTicketingProject && isCreator)
        {
            context.Fail(new AuthorizationFailureReason(this, "Task creator cannot change status for ticketing tasks."));
            return;
        }

        // If the changer is changing their own status
        if (isChangingOwnStatus)
        {
            if (isTaskMember || (!isTicketingProject && isCreator))
            {
                context.Succeed(requirement);
                return;
            }
            else  if (isTaskMember || (isTicketingProject && isProjectMember))
            {
                context.Succeed(requirement);
                return;
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "You are not authorized to change your status for this task."));
                return;
            }

        }
        else // The changer is changing someone else's status
        {
            //in general only creator can change other statuses, but in ticketing project members can chang every one status
            if (isTicketingProject)
            {
                if (isProjectMember)
                {
                    context.Succeed(requirement);
                    return;
                }
                else
                {
                    context.Fail(new AuthorizationFailureReason(this,
                        "Only project members or the task creator can change other members' status for ticketing tasks."));
                    return;
                }
            }
            else
            {
                if (isCreator || updateTaskPermission)
                {
                    context.Succeed(requirement);
                    return;
                }
                else
                {
                    context.Fail(new AuthorizationFailureReason(this,
                        "Only the task creator or users with 'Update Task' permission can change other members' status."));
                    return;
                }
            } 
        } 
    }
}
