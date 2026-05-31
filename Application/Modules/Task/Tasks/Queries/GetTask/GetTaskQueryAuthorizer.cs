using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Modules.Tasks.Tasks.Queries.GetTask;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Tasks.Queries.GetTask;

public class GetTaskQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetTaskQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetTaskQueryAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetTaskQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Tasks.ReadTask);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read task."));
            return;
        }
        else
        {
            if (await context.User.HasPermission(_userManager, _context, Permissions.Tasks.ViewAll))
            {
                context.Succeed(requirement);
                return;
            }

            if (await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.General.ViewAll))
            {
                context.Succeed(requirement);
                return;
            }

            if (!Guid.TryParse(_user.Id, out var userId))
            {
                context.Fail();
                return;
            }

            var task = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == requirement.Request!.Id, default);

            if (task == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Task not found."));
                return;
            }

            if (task.CreatorId == userId || task.Members.Any(m => m.MemberId == userId))
            {
                context.Succeed(requirement);
                return;
            }

            if (task.ProjectId != null)
            {
                if (await _userManager.HasPermissionAsync(_context, userId, Permissions.Projects.ViewAll))
                {
                    context.Succeed(requirement);
                    return;
                }

                var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
                    .Include(p => p.ProjectMembers)
                    .FirstOrDefaultAsync(p => p.Id == task.ProjectId, default);

                if (project != null &&
                    (project.CreatorId == userId || project.ProjectMembers.Any(pm => pm.MemberId == userId)))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (task.MileStoneId != null)
            {
                if (await _userManager.HasPermissionAsync(_context, userId,
                        Permissions.Projects.ViewAll))
                {
                    context.Succeed(requirement);
                    return;
                }

                var milestone = await _context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .Include(m => m.Project!)
                    .ThenInclude(p => p.ProjectMembers)
                    .FirstOrDefaultAsync(m => m.Id == task.MileStoneId, default);

                if (milestone != null && (milestone.Project!.CreatorId == userId ||
                                          milestone.Project.ProjectMembers.Any(pm => pm.MemberId == userId)))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (task.ClientId != null)
            {
                if (await _userManager.HasPermissionAsync(_context, userId,
                        Permissions.Clients.ViewAllClients))
                {
                    context.Succeed(requirement);
                    return;
                }

                var client = await _context.GetSet<Novologs.Domain.Entities.Client>()
                    .FirstOrDefaultAsync(c => c.Id == task.ClientId, default);

                if (client != null && (client.CreatorId == userId))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (task.ClientLeadId != null)
            {
                if (await _userManager.HasPermissionAsync(_context, userId,
                        Permissions.Clients.ViewAllClients))
                {
                    context.Succeed(requirement);
                    return;
                }

                var clientLead = await _context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .FirstOrDefaultAsync(cl => cl.Id == task.ClientLeadId, default);

                if (clientLead != null && (clientLead.CreatorId == userId))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (task.VendorId != null)
            {
                if (await _userManager.HasPermissionAsync(_context, userId,
                        Permissions.Vendors.VendorViewAll))
                {
                    context.Succeed(requirement);
                    return;
                }

                var vendor = await _context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .FirstOrDefaultAsync(v => v.Id == task.VendorId, default);

                if (vendor != null && (vendor.CreatorId == userId))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (task.VendorContractId != null)
            {
                if (await _userManager.HasPermissionAsync(_context, userId,
                        Permissions.Vendors.VendorViewAll))
                {
                    context.Succeed(requirement);
                    return;
                }

                var vendorContract = await _context.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .FirstOrDefaultAsync(vc => vc.Id == task.VendorContractId, default);

                if (vendorContract != null && (vendorContract.CreatorId == userId))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view tasks."));
            return;
        }
    }
}
