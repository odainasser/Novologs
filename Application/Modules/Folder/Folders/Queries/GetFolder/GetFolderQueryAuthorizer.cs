using Novologs.Application.Modules.Folder.Folders.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetFolder;

public class GetFolderQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetFolderQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetFolderQueryAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetFolderQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Folders.ReadFolder);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read folder."));
            return;
        }
        else
        {
            if (_user.Id == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "User not authenticated."));
                return;
            }

            if (!Guid.TryParse(_user.Id, out var userId))
            {
                context.Fail(new AuthorizationFailureReason(this, "Invalid user ID format."));
                return;
            }

            if (requirement.Request!.EntityType == FolderParentEntity.None ||
                await context.User.HasPermission(_userManager, _context,
                    Novologs.Domain.Constants.Permissions.Folders.ViewAllFolders) ||
                await context.User.HasPermission(_userManager, _context,
                    Novologs.Domain.Constants.Permissions.General.ViewAll))
            {
                context.Succeed(requirement);
                return;
            }

            if (requirement.Request.EntityType == FolderParentEntity.MyShare)
            {
                context.Succeed(requirement);
                return;
            }

            if (requirement.Request.EntityId.HasValue)
            {
                var folder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .Include(f => f.Shares)
                    .Include(f => f.Project!.ProjectMembers)
                    .Include(f => f.Milestone!.Project!.ProjectMembers)
                    .Include(f => f.Client)
                    .Include(f => f.Lead)
                    .Include(f => f.Vendor)
                    .Include(f => f.Contract)
                    .Include(f => f.Task!.Members)
                    .FirstOrDefaultAsync(f => f.Id == requirement.Request.EntityId, CancellationToken.None);

                if (folder == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Folder not found."));
                    return;
                }

                if (folder.CreatorId == userId ||
                    folder.Shares.Any(s => s.SharedWithUserId == userId) ||
                    (folder.Project != null && folder.Project.ProjectMembers.Any(m => m.MemberId == userId)) ||
                    (folder.Milestone != null &&
                     folder.Milestone.Project!.ProjectMembers.Any(m => m.MemberId == userId)) ||
                    (folder.Client != null && folder.Client.CreatorId == userId) ||
                    (folder.Lead != null && folder.Lead.CreatorId == userId) ||
                    (folder.Vendor != null && folder.Vendor.CreatorId == userId) ||
                    (folder.Contract != null && folder.Contract.CreatorId == userId) ||
                    (folder.Task != null && folder.Task.Members.Any(m => m.MemberId == userId)))
                {
                    context.Succeed(requirement);
                    return;
                }

                if (folder.Type == FolderType.General)
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view this folder."));
            return;
        }
    }
}
