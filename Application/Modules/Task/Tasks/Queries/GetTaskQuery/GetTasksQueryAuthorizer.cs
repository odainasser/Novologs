using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Tasks.Queries.GetTaskQuery;

public class GetTasksQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetTasksQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetTasksQueryAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetTasksQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Tasks.ReadTask);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read tasks."));
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
            else if (requirement.Request!.CreatFilter is TaskCreatFilter.MyCreated or TaskCreatFilter.MyAssigned
                     or TaskCreatFilter.MyCreatedAndAssigned or TaskCreatFilter.MyBacklog
                     or TaskCreatFilter.MyAll)
            {
                context.Succeed(requirement);
                return;
            }
            else if (requirement.Request.ControlEntityId != null)
            {
                var isAuthorized = false;
                switch (requirement.Request.ControlEntity)
                {
                    case TaskControlEntity.Project:
                        isAuthorized = await _context.GetSet<Novologs.Domain.Entities.Project>()
                            .AnyAsync(p => p.Id == requirement.Request.ControlEntityId &&
                                           (p.CreatorId == _user.IdGuid ||
                                            p.ProjectMembers.Any(m => m.MemberId == _user.IdGuid)), default);
                        //or project view all
                        if (!isAuthorized)
                        {
                            isAuthorized = await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                                Permissions.Projects.ViewAll);
                        }

                        break;
                    case TaskControlEntity.Milestone:
                        isAuthorized = await _context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                            .AnyAsync(m => m.Id == requirement.Request.ControlEntityId &&
                                           (m.Project!.CreatorId == _user.IdGuid ||
                                            m.Project.ProjectMembers.Any(mem => mem.MemberId == _user.IdGuid)), default);
                        //or project view all
                        if (!isAuthorized)
                        {
                            isAuthorized = await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                                Permissions.Projects.ViewAll);
                        }
                        break;
                    case TaskControlEntity.Client:
                        isAuthorized = await _context.GetSet<Novologs.Domain.Entities.Client>()
                            .AnyAsync(c => c.Id == requirement.Request.ControlEntityId &&
                                           (c.CreatorId == _user.IdGuid), default);
                        //or client view all
                        if (!isAuthorized)
                        {
                            isAuthorized = await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                                Permissions.Clients.ViewAllClients);
                        }

                        break;
                    case TaskControlEntity.ClientLead:
                        isAuthorized = await _context.GetSet<Novologs.Domain.Entities.ClientLead>()
                            .AnyAsync(cl => cl.Id == requirement.Request.ControlEntityId &&
                                            (cl.CreatorId == _user.IdGuid), default);
                        //or client view all
                        if (!isAuthorized)
                        {
                            isAuthorized = await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                                Permissions.Clients.ViewAllClients);
                        }
                        break;
                    case TaskControlEntity.Vendor:
                        isAuthorized = await _context.GetSet<Novologs.Domain.Entities.Vendor>()
                            .AnyAsync(v => v.Id == requirement.Request.ControlEntityId &&
                                           (v.CreatorId == _user.IdGuid), default);
                        //or vendor view all
                        if (!isAuthorized)
                        {
                            isAuthorized = await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                                Permissions.Vendors.VendorViewAll);
                        }
                        break;
                    case TaskControlEntity.VendorContract:
                        isAuthorized = await _context.GetSet<Novologs.Domain.Entities.VendorContract>()
                            .AnyAsync(vc => vc.Id == requirement.Request.ControlEntityId &&
                                            (vc.CreatorId == _user.IdGuid), default);
                        //or vendor view all
                        if (!isAuthorized)
                        {
                            isAuthorized = await _userManager.HasPermissionAsync(_context, _user.IdGuid!.Value,
                                Permissions.Vendors.VendorViewAll);
                        }
                        break;
                    case TaskControlEntity.ParentTask:
                        isAuthorized = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                            .AnyAsync(pt => pt.Id == requirement.Request.ControlEntityId &&
                                            (pt.CreatorId == _user.IdGuid ||
                                             pt.Members.Any(m => m.MemberId == _user.IdGuid)), default);
                        break;
                    default:
                        isAuthorized = false;
                        break;
                }

                if (isAuthorized)
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view tasks."));
        }
    }
}
