
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Sources.Commands.DeleteSource;

public class DeleteSourceCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteSourceCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    
    public DeleteSourceCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteSourceCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.DeleteLeadSource);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete lead source."));
            return;
        }
        else
        {
            //get lead source by id, if it belongs to the current user then its ok
            var leadSource = await _context.GetSet<LeadSource>()
                .FirstOrDefaultAsync(ls => ls.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

            if (leadSource != null && leadSource.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete lead source."));
            return;
        }
    }
}
