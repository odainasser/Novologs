using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Common.Authorization;

public static class AuthorizationHelper
{
    /// <summary>
    /// True if the principal has the named permission — granted directly
    /// (<see cref="UserPermission"/>) or via a role (<see cref="RolePermission"/>).
    /// SuperAdmin short-circuits to true.
    /// </summary>
    public static async Task<bool> HasPermission(this ClaimsPrincipal userClaim, UserManager<TenantUser> userManager,
        ITenantDbContext context, string permissionName)
    {
        if (userClaim.IsInRole(Novologs.Domain.Constants.Roles.SuperAdmin))
        {
            return true;
        }

        if (!Guid.TryParse(userClaim.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return false;
        }

        var hasDirectPermission = await context.GetSet<UserPermission>()
            .AsNoTracking()
            .Where(up => up.UserId == userId && up.Permission.Name == permissionName)
            .AnyAsync();

        if (hasDirectPermission)
        {
            return true;
        }

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return false;
        }

        var userRoles = (await userManager.GetRolesAsync(user)).ToList();
        if (userRoles.Count == 0)
        {
            return false;
        }

        if (userRoles.Contains(Novologs.Domain.Constants.Roles.SuperAdmin))
        {
            return true;
        }

        return await context.GetSet<RolePermission>()
            .AsNoTracking()
            .Where(rp => userRoles.Contains(rp.Role.Name!) && rp.Permission.Name == permissionName)
            .AnyAsync();
    }

    public static async Task<bool> HasPermissionAsync(this UserManager<TenantUser> userManager,
        ITenantDbContext context, Guid userId,
        string permissionName)
    {
        var hasDirectPermission = await context.GetSet<UserPermission>()
            .AsNoTracking()
            .Where(up => up.UserId == userId && up.Permission.Name == permissionName)
            .AnyAsync();

        if (hasDirectPermission)
        {
            return true;
        }

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return false;
        }

        var userRoles = (await userManager.GetRolesAsync(user)).ToList();
        if (userRoles.Count == 0)
        {
            return false;
        }

        if (userRoles.Contains(Novologs.Domain.Constants.Roles.SuperAdmin))
        {
            return true;
        }

        return await context.GetSet<RolePermission>()
            .AsNoTracking()
            .Where(rp => userRoles.Contains(rp.Role.Name!) && rp.Permission.Name == permissionName)
            .AnyAsync();
    }

    public static async Task<List<TenantUser>> GetUsersInPermissionAsync(this UserManager<TenantUser> userManager,
        ITenantDbContext context, string permissionName)
    {
        var usersWithPermission = new List<TenantUser>();

        var userIdsWithDirectPermission = await context.GetSet<UserPermission>()
            .AsSplitQuery().AsNoTracking()
            .Where(up => up.Permission.Name == permissionName)
            .Select(up => up.UserId)
            .ToListAsync();

        usersWithPermission.AddRange(await userManager.Users
            .Where(u => userIdsWithDirectPermission.Contains(u.Id))
            .ToListAsync());

        var roleNamesWithPermission = await context.GetSet<RolePermission>()
            .AsSplitQuery().AsNoTracking()
            .Where(rp => rp.Permission.Name == permissionName)
            .Select(rp => rp.Role.Name!)
            .ToListAsync();

        foreach (var roleName in roleNamesWithPermission)
        {
            var usersInRole = await userManager.GetUsersInRoleAsync(roleName);
            usersWithPermission.AddRange(usersInRole);
        }

        return usersWithPermission.DistinctBy(u => u.Id).ToList();
    }
}
