using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Settings.Commands.AddSetting;
using Novologs.Domain.Entities;

namespace Novologs.Application.Settings.Commands.AddSetting;

public class AddSettingCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddSettingCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    
    public AddSettingCommandAuthorizer(
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
        ZetaAuthorizationRequirement<AddSettingCommand> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,Domain.Constants.Permissions.General.Settings);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add setting."));
            return;
        }
        else
        {
            context.Succeed(requirement);
        }
    }


}
