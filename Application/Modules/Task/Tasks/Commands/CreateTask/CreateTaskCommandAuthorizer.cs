using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Modules.Tasks.Tasks.Commands.CreateTask;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.CreateTask;

public class CreateTaskCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<CreateTaskCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public CreateTaskCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<CreateTaskCommand> requirement)
    {
        var user = await _context.GetSet<TenantUser>().AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == _user.IdGuid);
        if (user == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Current user not found."));
            return;
        }

        if (requirement.Request!.ProjectId.HasValue)
        {
            var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
                .Include(p => p.ProjectMembers)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == requirement.Request.ProjectId.Value);
            if (project == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Project not found."));
                return;
            }

            var isProjectMember = project.ProjectMembers.Any(m => m.MemberId == _user.IdGuid) == true;

            if (project.Type == Novologs.Domain.Enums.ProjectType.Ticketing)
            {
                var hasTicketingPermission = await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                    Novologs.Domain.Constants.Permissions.Ticketing.AddTicket);
                if (hasTicketingPermission)
                {
                    //now audio is ok members still not
                    if (requirement.Request.MembersIds.Any())
                    {
                        context.Fail(
                            new AuthorizationFailureReason(this, "Tickets cannot have members."));
                        return;
                    }


                    if (isProjectMember)
                    {
                        context.Fail(new AuthorizationFailureReason(this,
                            "Project members cannot create tickets for this project."));
                        return;
                    }

                    context.Succeed(requirement);
                    return;
                }
                else
                {
                    context.Fail(new AuthorizationFailureReason(this,
                        "User is not authorized to add tickets to this project."));
                    return;
                }
            }
            else if (!isProjectMember && project?.CreatorId != _user.IdGuid)
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "User is not authorized to create tasks for this project."));
                return;
            }
        }

        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Tasks.AddTask);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to create task."));
            return;
        }

        //if any of task members (other than current user) hase DontAssignTasks permission then fail
        if (requirement.Request!.MembersIds.Any())
        {
            var members = await _context.GetSet<TenantUser>()
                .Where(u => requirement.Request.MembersIds.Contains(u.Id))
                .ToListAsync();

            foreach (var member in members)
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

        //if audio file user should have CreateAiTask permission 
        if (requirement.Request!.AudioFileId != null && !await context.User.HasPermission(_userManager, _context,
                Novologs.Domain.Constants.Permissions.Tasks.CreateAiTask))
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to create AI tasks."));
            return;
        }

        var organizationStructure = await _context.GetSet<OrganizationStructure>()
            .Include(d => d.Children)
            .AsSingleQuery().AsNoTracking()
            .ToListAsync();

        var currentUserNode = organizationStructure
            .FirstOrDefault(d => d.EmployeeId == _user.IdGuid);

        var taskLevelElveator = 0;
        if (await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                Permissions.Tasks.HasTaskLevelElevator))
        {
            taskLevelElveator = user?.TaskLevelElveator ?? 0;
        }

        var allVisibleUsersIds =
            HierarchUtil.GetTaskAvailableMembers(organizationStructure, _user.IdGuid, taskLevelElveator);

        if (requirement.Request.MembersIds.Any(memberId => !allVisibleUsersIds.Contains(memberId)))
        {
            context.Fail(new AuthorizationFailureReason(this,
                "One or more assigned members are not within your visible hierarchy or cannot be assigned tasks."));
            return;
        }

        context.Succeed(requirement);
        return;
    }
}
