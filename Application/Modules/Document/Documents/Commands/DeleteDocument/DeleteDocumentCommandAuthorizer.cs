using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Document.Documents.Commands.DeleteDocument;

public class DeleteDocumentCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteDocumentCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteDocumentCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteDocumentCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Documents.Delete);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete document."));
            return;
        }
        else
        {
            //get document by id, if it belongs to the current user then its ok
            var document = await _context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                .FirstOrDefaultAsync(d => d.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

            if (document != null && document.CreatorId == Guid.Parse(_user.Id!))
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete documents."));
            return;
        }
    }
}
