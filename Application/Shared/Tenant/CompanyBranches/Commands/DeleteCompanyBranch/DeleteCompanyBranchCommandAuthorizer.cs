using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.CompanyBranches.Commands.DeleteCompanyBranch;

public class
    DeleteCompanyBranchCommandAuthorizer : AuthorizationHandler<
    ZetaAuthorizationRequirement<DeleteCompanyBranchCommand>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteCompanyBranchCommandAuthorizer(UserManager<TenantUser> userManager, ITenantDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }


    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<DeleteCompanyBranchCommand> requirement
    )
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.CompanyBranch.Delete);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete company branch."));
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
