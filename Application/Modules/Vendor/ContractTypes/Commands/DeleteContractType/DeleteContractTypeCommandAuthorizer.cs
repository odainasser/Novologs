
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Vendor.ContractTypes.Commands.DeleteContractType;

public class DeleteContractTypeCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteContractTypeCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    
    public DeleteContractTypeCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteContractTypeCommand> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Vendors.DeleteVendorContractType);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete vendor contract type."));
            return;
        }
        else
        {
            //get contract type
            var contractType = await _context.GetSet<Novologs.Domain.Entities.VendorContractType>()
                .FirstOrDefaultAsync(x => x.Id == requirement.Request!.Id);

            if (contractType == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Contract Type not found."));
                return;
            }

            //or he is the creator
            if (contractType.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete vendor contract types."));
            }
        }
    }

}
