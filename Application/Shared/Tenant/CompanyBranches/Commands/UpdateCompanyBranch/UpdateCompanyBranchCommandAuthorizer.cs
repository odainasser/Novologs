using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.CompanyBranches.Commands.UpdateCompanyBranch;

public class
    UpdateCompanyBranchCommandAuthorizer : AuthorizationHandler<
    ZetaAuthorizationRequirement<UpdateCompanyBranchCommand>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateCompanyBranchCommandAuthorizer(UserManager<TenantUser> userManager, ITenantDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }


    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<UpdateCompanyBranchCommand> requirement
    )
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.CompanyBranch.Update);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update company branch."));
            return;
        }
        else
        {
            //todo Add permission 
            context.Succeed(requirement);
            return;
        }
    }
}
