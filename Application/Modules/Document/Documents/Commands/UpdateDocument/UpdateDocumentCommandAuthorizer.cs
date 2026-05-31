using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Document.Documents.Commands.UpdateDocument;

public class UpdateDocumentCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateDocumentCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateDocumentCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateDocumentCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Documents.Update);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update document."));
            return;
        }
        else
        {
            var document = await _context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                .Include(d => d.Members)
                .Include(d => d.Task)
                .ThenInclude(t => t!.Project)
                .FirstOrDefaultAsync(d => d.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

            if (document == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Document not found."));
                return;
            }

            if (document.CreatorId == Guid.Parse(_user.Id!) ||
                document.Members.Any(m => m.MemberId == Guid.Parse(_user.Id!)))
            {
                context.Succeed(requirement);
                return;
            }
            
            if (document.Task?.CreatorId == Guid.Parse(_user.Id!))
            {
                context.Succeed(requirement);
                return;
            }

            if (document.Task?.Project?.Type == ProjectType.Ticketing &&
                document.Task.Project.ProjectMembers.Any(m => m.MemberId == Guid.Parse(_user.Id!)))
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update documents."));
            return;
        }
    }
}
