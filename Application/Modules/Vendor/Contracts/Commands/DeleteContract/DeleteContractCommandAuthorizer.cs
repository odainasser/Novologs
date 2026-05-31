using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Vendor.Contracts.Commands.DeleteContract;

public class DeleteContractCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteContractCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteContractCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteContractCommand> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Vendors.DeleteContract);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete contract."));
            return;
        }
        else
        {
            //get contract including vendor
            var contract = _context.GetSet<Novologs.Domain.Entities.VendorContract>()
                .Include(vc => vc.Vendor)
                .FirstOrDefault(vc => vc.Id == requirement.Request!.Id);

            if (contract == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Contract not found."));
                return;
            }

            //or he is the owner of contract 
            if (contract.CreatorId == _user.IdGuid)
            {
                context.Succeed(requirement);
            }
            //or he is the owner of vendor  
            else if (contract.Vendor != null && contract.Vendor.CreatorId == _user.IdGuid)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete contracts."));
            }
        }
    }
}
