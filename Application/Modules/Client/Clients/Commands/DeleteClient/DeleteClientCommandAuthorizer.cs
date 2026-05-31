using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Clients.Commands.DeleteClient;

public class DeleteClientCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteClientCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteClientCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteClientCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.DeleteClient);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete client."));
            return;
        }
        else
        {
            var client = await _context.GetSet<Novologs.Domain.Entities.Client>()
                .FirstOrDefaultAsync(c => c.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

            if (client != null && client.CreatorId == _user.IdGuid)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete this client."));
            return;
        }
    }
}
