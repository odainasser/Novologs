using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Document.Documents.Commands.AddDocument;

public class AddDocumentCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddDocumentCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public AddDocumentCommandAuthorizer(
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
        ZetaAuthorizationRequirement<AddDocumentCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Documents.Create);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add document."));
            return;
        }
        else
        {
            //if he has access to parent document or to task or to project ....
            if (requirement.Request!.ParentDocumentId.HasValue)
            {
                var parentDocument = await _context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .Include(d => d.Members)
                    .FirstOrDefaultAsync(d => d.Id == requirement.Request.ParentDocumentId.Value);

                if (parentDocument == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Parent document not found."));
                    return;
                }

                if (parentDocument.Members.Any(m => m.MemberId == Guid.Parse(_user.Id!)))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (requirement.Request.TaskId.HasValue)
            {
                var task = await _context.GetSet<ProjectTask>()
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == requirement.Request.TaskId.Value);

                if (task == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Task not found."));
                    return;
                }

                if (task.CreatorId == Guid.Parse(_user.Id!))
                {
                    context.Succeed(requirement);
                    return;
                }

                if (task.Project?.Type == ProjectType.Ticketing &&
                    (
                        task.CreatorId == Guid.Parse(_user.Id!) ||
                        task.Project.ProjectMembers.Any(m => m.MemberId == Guid.Parse(_user.Id!)
                        )))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (requirement.Request.ProjectId.HasValue)
            {
                var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
                    .Include(p => p.ProjectMembers)
                    .FirstOrDefaultAsync(p => p.Id == requirement.Request.ProjectId.Value);

                if (project == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Project not found."));
                    return;
                }

                if (project.ProjectMembers.Any(m => m.MemberId == Guid.Parse(_user.Id!)))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (requirement.Request.MileStoneId.HasValue)
            {
                var milestone = await _context.GetSet<ProjectMileStone>()
                    .Include(m => m.Project!.ProjectMembers)
                    .FirstOrDefaultAsync(m => m.Id == requirement.Request.MileStoneId.Value);

                if (milestone == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Milestone not found."));
                    return;
                }

                if (milestone.Project!.ProjectMembers.Any(m => m.MemberId == Guid.Parse(_user.Id!)))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (requirement.Request.ClientId.HasValue)
            {
                var client = await _context.GetSet<Novologs.Domain.Entities.Client>()
                    .FirstOrDefaultAsync(c => c.Id == requirement.Request.ClientId.Value);

                if (client == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Client not found."));
                    return;
                }

                if (client.CreatorId == Guid.Parse(_user.Id!))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (requirement.Request.ClientLeadId.HasValue)
            {
                var clientLead = await _context.GetSet<ClientLead>()
                    .Include(cl => cl.Client)
                    .FirstOrDefaultAsync(cl => cl.Id == requirement.Request.ClientLeadId.Value);

                if (clientLead == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Client Lead not found."));
                    return;
                }

                if (clientLead.Client!.CreatorId == Guid.Parse(_user.Id!) ||
                    clientLead.CreatorId == Guid.Parse(_user.Id!))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (requirement.Request.VendorId.HasValue)
            {
                var vendor = await _context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .FirstOrDefaultAsync(v => v.Id == requirement.Request.VendorId.Value);

                if (vendor == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Vendor not found."));
                    return;
                }

                if (vendor.CreatorId == Guid.Parse(_user.Id!))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (requirement.Request.VendorContractId.HasValue)
            {
                var vendorContract = await _context.GetSet<VendorContract>()
                    .Include(vc => vc.Vendor)
                    .FirstOrDefaultAsync(vc => vc.Id == requirement.Request.VendorContractId.Value);

                if (vendorContract == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Vendor Contract not found."));
                    return;
                }

                if (vendorContract.CreatorId == Guid.Parse(_user.Id!) ||
                    vendorContract.Vendor!.CreatorId == Guid.Parse(_user.Id!))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            context.Succeed(requirement);
            return;
        }
    }
}
