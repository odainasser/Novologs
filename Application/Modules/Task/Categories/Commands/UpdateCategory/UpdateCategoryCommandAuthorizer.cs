using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Categories.Commands.UpdateCategory;

public class UpdateCategoryCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateCategoryCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateCategoryCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<UpdateCategoryCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Tasks.UpdateTaskCategory);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update task category."));
            return;
        }
        else
        {
            var category = await _context.GetSet<Novologs.Domain.Entities.TaskCategory>()
                .FirstOrDefaultAsync(c => c.Id == requirement.Request!.Id);
            if (category == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Category not found."));
                return;
            }
            
            context.Succeed(requirement);
            return;
        }
    }
}
