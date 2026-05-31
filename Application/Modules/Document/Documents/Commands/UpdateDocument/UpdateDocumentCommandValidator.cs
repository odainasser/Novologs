using FluentValidation.Validators;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Document.Documents.Commands.UpdateDocument;

public class UpdateDocumentCommandValidator : AbstractValidator<UpdateDocumentCommand>
{
    public UpdateDocumentCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Document Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .AnyAsync(d => d.Id == id, cancellationToken);
            }).WithMessage("Document not found.");

        RuleFor(v => v.Title)
            .MaximumLength(2048).When(v => v.Title != null).WithMessage("Title must not exceed 2048 characters.");

        RuleFor(v => v.ParentDocumentId)
            .MustAsync(async (parentId, cancellationToken) =>
            {
                if (parentId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .AnyAsync(d => d.Id == parentId, cancellationToken);
            }).WithMessage("Parent document does not exist.");

        RuleFor(v => v.DocumentCategoryId)
            .MustAsync(async (categoryId, cancellationToken) =>
            {
                if (categoryId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.DocumentCategory>()
                    .AnyAsync(c => c.Id == categoryId, cancellationToken);
            }).WithMessage("Document category does not exist.");

        RuleFor(v => v.Members)
            .MustAsync(async (members, cancellationToken) =>
            {
                if (members == null || !members.Any()) return true;
                var memberIds = members.Select(m => m.MemberId).Distinct();
                var existingMembersCount = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .CountAsync(u => memberIds.Contains(u.Id) && u.IsActive, cancellationToken);
                return existingMembersCount == memberIds.Count();
            }).WithMessage("One or more members do not exist or are inactive.");

        RuleFor(v => v.DocumentContent)
            .SetValidator(new DocumentVersionInputDtoValidator()).When(v => v.DocumentContent != null)
            ;
        RuleFor(v => v.CurrentVersion)
            .MustAsync(async (command, currentVersion, cancellationToken) =>
            {
                if (currentVersion == null) return true;
                var document = await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .Include(d => d.DocumentVersionList)
                    .FirstOrDefaultAsync(d => d.Id == command.Id, cancellationToken);
                if (document == null) return false;
                var versionExists = document.DocumentVersionList.Any(v => v.Version == currentVersion);
                if (!versionExists && command.DocumentContent != null &&
                    command.DocumentContent.Version == currentVersion)
                {
                    return true;
                }

                return versionExists;
            }).WithMessage("Current version 'Identifier' is not valid.");

        RuleFor(v => v.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
            {
                if (projectId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == projectId, cancellationToken);
            }).WithMessage("Project does not exist.");

        RuleFor(v => v.MileStoneId)
            .MustAsync(async (mileStoneId, cancellationToken) =>
            {
                if (mileStoneId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .AnyAsync(m => m.Id == mileStoneId, cancellationToken);
            }).WithMessage("Milestone does not exist.");

        RuleFor(v => v.ClientId)
            .MustAsync(async (clientId, cancellationToken) =>
            {
                if (clientId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(c => c.Id == clientId, cancellationToken);
            }).WithMessage("Client does not exist.");

        RuleFor(v => v.ClientLeadId)
            .MustAsync(async (clientLeadId, cancellationToken) =>
            {
                if (clientLeadId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(cl => cl.Id == clientLeadId, cancellationToken);
            }).WithMessage("Client Lead does not exist.");

        RuleFor(v => v.VendorId)
            .MustAsync(async (vendorId, cancellationToken) =>
            {
                if (vendorId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(v => v.Id == vendorId, cancellationToken);
            }).WithMessage("Vendor does not exist.");
        RuleFor(v => v.VendorContractId)
            .MustAsync(async (vendorContractId, cancellationToken) =>
            {
                if (vendorContractId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .AnyAsync(vc => vc.Id == vendorContractId, cancellationToken);
            }).WithMessage("Vendor Contract does not exist.");
        RuleFor(v => v.TaskId)
            .MustAsync(async (taskId, cancellationToken) =>
            {
                if (taskId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(t => t.Id == taskId, cancellationToken);
            }).WithMessage("Task does not exist.");

        //only document members can edit 
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                var document = await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .Include(d => d.Members)
                    .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
                if (document == null) return true;
                return document.Members.Any(m => m.MemberId == Guid.Parse(user.Id!));
            }).WithMessage("Only document members can edit the document.");
    }
}

public class DocumentVersionInputDtoValidator : AbstractValidator<DocumentVersionInputDto?>
{
    public DocumentVersionInputDtoValidator()
    {
        RuleFor(v => v!.Title)
            .MaximumLength(2048).WithMessage("Title must not exceed 2048 characters.");

        RuleFor(v => v!.Description)
            .MaximumLength(4096).WithMessage("Description must not exceed 4096 characters.");

        RuleFor(v => v!.Content)
            .MaximumLength(1000000).WithMessage("Content must not exceed 1,000,000 characters.");
    }
}
