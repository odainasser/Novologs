using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Utility;

public class RoleUtility
{
    public RoleUtility()
    {
    }

    public static async Task<Result<T>> CanAssignePermission<T>(Guid userId, List<Guid> permissionIds,
        UserManager<TenantUser> userManager, ITenantDbContext dbContext)
    {
        var (isValid, error, message) = await ValidatePermissionAssignment(userId, permissionIds, userManager, dbContext);
        if (!isValid)
        {
            return Result<T>.Failure(error, message);
        }

        return Result<T>.Success(default!);
    }

    public static async Task AuthorizePermissionAssignment(
        AuthorizationHandlerContext context,
        IAuthorizationHandler handler,
        IUser user,
        UserManager<TenantUser> userManager,
        ITenantDbContext dbContext,
        IEnumerable<Guid> permissionIds)
    {
        var (isValid, _, message) =
            await ValidatePermissionAssignment(user.IdGuid!.Value, permissionIds, userManager, dbContext);
        if (!isValid)
        {
            context.Fail(new AuthorizationFailureReason(handler, message));
        }
    }

    private static async Task<(bool IsValid, string Error, string Message)> ValidatePermissionAssignment(
        Guid userId,
        IEnumerable<Guid> permissionIds,
        UserManager<TenantUser> userManager,
        ITenantDbContext dbContext)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return (false, "User.NotFound", $"User with ID {userId} not found.");
        }

        var userPermissions = await dbContext.GetSet<UserPermission>()
            .Where(up => up.UserId == userId)
            .Select(up => up.Permission.Name)
            .ToListAsync();

        var userRoles = (await userManager.GetRolesAsync(user)).ToList();
        var rolePermissions = await dbContext.GetSet<RolePermission>()
            .Where(rp => userRoles.Contains(rp.Role.Name!))
            .Select(rp => rp.Permission.Name)
            .ToListAsync();

        var allUserPermissions = userPermissions.Union(rolePermissions).ToList();

        var requestedPermissions = await dbContext.GetSet<Permission>()
            .Where(p => permissionIds.Contains(p.Id))
            .Select(p => p.Name)
            .ToListAsync();

        foreach (var requestedPermission in requestedPermissions)
        {
            if (requestedPermission.StartsWith("General."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.Settings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign general settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Users."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.UserSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign user settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Task."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.TaskSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign task settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Project."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.ProjectSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign project settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Mission."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.MissionSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign mission settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Milestone."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.MilestoneSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign milestone settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Client.") || requestedPermission.StartsWith("Lead.") ||
                     requestedPermission.StartsWith("LeadSource.") ||
                     requestedPermission.StartsWith("LeadSaleStatus.") ||
                     requestedPermission.StartsWith("LeadRejectionReason.") ||
                     requestedPermission.StartsWith("SalesTarget."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.ClientSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign client settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Vendor.") || requestedPermission.StartsWith("Contract."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.VendorSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign vendor settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Comment."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.CommentSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign comment settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Chat."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.ChatSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign chat settings permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Accounting."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.Accounting))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign accounting permissions.");
                }
            }
            else if (requestedPermission.StartsWith("UserGroups."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.UserSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign user group permissions.");
                }
            }
            else if (requestedPermission.StartsWith("TicketingProject."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.ProjectSettings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign ticketing project permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Documents."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.Settings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign document permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Finance."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.Accounting))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign finance permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Folders."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.Settings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign folder permissions.");
                }
            }
            else if (requestedPermission.StartsWith("CompanyBranch."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.Settings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign company branch permissions.");
                }
            }
            else if (requestedPermission.StartsWith("Roles."))
            {
                if (!allUserPermissions.Contains(Domain.Constants.Permissions.General.Settings))
                {
                    return (false, "Permission.Denied", "User is not authorized to assign role permissions.");
                }
            }
        }

        return (true, string.Empty, string.Empty);
    }
}
