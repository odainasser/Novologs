using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Vendor.Contacts.Commands.AddContact;

public class AddContactCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddContactCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public AddContactCommandAuthorizer(
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
        ZetaAuthorizationRequirement<AddContactCommand> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Vendors.AddVendorContact);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add vendor contact."));
            return;
        }
        else
        {
            //get the vendor by VendorId
            if (requirement.Request?.VendorId != null)
            {
                var vendor = await _context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .FirstOrDefaultAsync(v => v.Id == requirement.Request.VendorId);

                if (vendor == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Vendor not found."));
                    return;
                }

                //if user is the vendor creator then OK
                if (vendor.CreatorId == _user.IdGuid)
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add contacts."));
            return;
        }
    }
}
