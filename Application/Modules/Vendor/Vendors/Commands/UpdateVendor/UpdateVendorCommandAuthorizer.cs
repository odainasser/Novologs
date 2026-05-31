
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Vendor.Vendors.Commands.UpdateVendor;

public class UpdateVendorCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateVendorCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    public UpdateVendorCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected async override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<UpdateVendorCommand> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Vendors.UpdateVendor);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update vendor."));
            return;
        }
        else
        {
            //get vendor
            var vendor = await _context.GetSet<Novologs.Domain.Entities.Vendor>()
                .FirstOrDefaultAsync(x => x.Id == requirement.Request!.Id);

            if (vendor == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Vendor not found."));
                return;
            }

            if (vendor.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update vendors."));
            }
        }
    }

}
