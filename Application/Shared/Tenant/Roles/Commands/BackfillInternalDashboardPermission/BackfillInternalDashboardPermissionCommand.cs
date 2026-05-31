using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.BackfillInternalDashboardPermission;

public record BackfillInternalDashboardPermissionCommand : IRequest<Result<BackfillInternalDashboardPermissionResponse>>
{
}

public class BackfillInternalDashboardPermissionResponse
{
    public bool PermissionAlreadyAssigned { get; set; }
    public bool PermissionAdded { get; set; }
    public int AffectedUsersCount { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class BackfillInternalDashboardPermissionCommandValidator : AbstractValidator<BackfillInternalDashboardPermissionCommand>
{
    public BackfillInternalDashboardPermissionCommandValidator()
    {
        // No validation needed for this command
    }
}

public class BackfillInternalDashboardPermissionCommandHandler : IRequestHandler<BackfillInternalDashboardPermissionCommand, Result<BackfillInternalDashboardPermissionResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly ILogger<BackfillInternalDashboardPermissionCommandHandler> _logger;

    public BackfillInternalDashboardPermissionCommandHandler(
        ITenantDbContext context,
        ILogger<BackfillInternalDashboardPermissionCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<BackfillInternalDashboardPermissionResponse>> Handle(
        BackfillInternalDashboardPermissionCommand request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting backfill of dashboard permission for Internal role");

        // Find the Internal role
        var internalRole = await _context.GetSet<IdentityRole<Guid>>()
            .FirstOrDefaultAsync(r => r.Name == Domain.Constants.Roles.Internal, cancellationToken);

        if (internalRole == null)
        {
            _logger.LogError("Internal role not found in database");
            return Result<BackfillInternalDashboardPermissionResponse>.Failure(
                "Role.NotFound",
                "Internal role not found in the system.");
        }

        // Find the dashboard permission
        var dashboardPermission = await _context.GetSet<Permission>()
            .FirstOrDefaultAsync(p => p.Name == Permissions.General.AssignAllowViewAdminDashboard, cancellationToken);

        if (dashboardPermission == null)
        {
            _logger.LogError("Dashboard permission not found in database");
            return Result<BackfillInternalDashboardPermissionResponse>.Failure(
                "Permission.NotFound",
                $"Permission '{Permissions.General.AssignAllowViewAdminDashboard}' not found in the system.");
        }

        // Check if the permission is already assigned to the Internal role
        var existingRolePermission = await _context.GetSet<RolePermission>()
            .FirstOrDefaultAsync(rp => rp.RoleId == internalRole.Id && rp.PermissionId == dashboardPermission.Id, cancellationToken);

        var response = new BackfillInternalDashboardPermissionResponse();

        if (existingRolePermission != null)
        {
            _logger.LogInformation("Dashboard permission already assigned to Internal role");
            
            // Count users in Internal role
            var userCount = await _context.GetSet<IdentityUserRole<Guid>>()
                .CountAsync(ur => ur.RoleId == internalRole.Id, cancellationToken);

            response.PermissionAlreadyAssigned = true;
            response.PermissionAdded = false;
            response.AffectedUsersCount = userCount;
            response.Message = $"Dashboard permission was already assigned to Internal role. {userCount} users with Internal role already have access.";
            
            return Result<BackfillInternalDashboardPermissionResponse>.Success(response);
        }

        // Create the role permission assignment
        var rolePermission = new RolePermission(Guid.NewGuid())
        {
            RoleId = internalRole.Id,
            PermissionId = dashboardPermission.Id
        };

        _context.GetSet<RolePermission>().Add(rolePermission);
        await _context.SaveChangesAsync(cancellationToken);

        // Count users in Internal role who will now have the permission
        var affectedUserCount = await _context.GetSet<IdentityUserRole<Guid>>()
            .CountAsync(ur => ur.RoleId == internalRole.Id, cancellationToken);

        _logger.LogInformation(
            "Successfully assigned dashboard permission to Internal role. {UserCount} users affected",
            affectedUserCount);

        response.PermissionAlreadyAssigned = false;
        response.PermissionAdded = true;
        response.AffectedUsersCount = affectedUserCount;
        response.Message = $"Dashboard permission successfully assigned to Internal role. {affectedUserCount} users now have access to the dashboard.";

        return Result<BackfillInternalDashboardPermissionResponse>.Success(response);
    }
}
