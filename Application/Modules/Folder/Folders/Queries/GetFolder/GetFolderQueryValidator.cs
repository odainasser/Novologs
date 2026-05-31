using Novologs.Application.Modules.Folder.Folders.Dto;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetFolder;

public class GetFolderQueryValidator : AbstractValidator<GetFolderQuery>
{
    public GetFolderQueryValidator(ITenantDbContext context)
    {
        RuleFor(v => v.EntityId)
            .NotEmpty()
            .When(v => !(v.EntityType == FolderParentEntity.None || v.EntityType == FolderParentEntity.All ||
                         v.EntityType == FolderParentEntity.MyShare || v.EntityType == FolderParentEntity.Document ||
                         v.EntityType == FolderParentEntity.DeletedItems))
            .WithMessage("EntityId is required when EntityType is specified.");
        RuleFor(v => v.EntityType)
            .IsInEnum()
            .WithMessage("Invalid EntityType.");

        RuleFor(v => v.EntityId)
            .MustAsync(async (model, entityId, ct) =>
            {
                if (model.EntityType == FolderParentEntity.None || model.EntityType == FolderParentEntity.All ||
                    model.EntityType == FolderParentEntity.DeletedItems || entityId == null) return true;

                return model.EntityType switch
                {
                    FolderParentEntity.Project => await context.GetSet<Novologs.Domain.Entities.Project>()
                        .AnyAsync(p => p.Id == entityId, ct),
                    FolderParentEntity.Mission => await context.GetSet<Novologs.Domain.Entities.Project>()
                        .AnyAsync(p => p.Id == entityId && p.Type == Novologs.Domain.Enums.ProjectType.Mission, ct),
                    FolderParentEntity.Milestone => await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                        .AnyAsync(m => m.Id == entityId, ct),
                    FolderParentEntity.Client => await context.GetSet<Novologs.Domain.Entities.Client>()
                        .AnyAsync(c => c.Id == entityId, ct),
                    FolderParentEntity.Lead => await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                        .AnyAsync(l => l.Id == entityId, ct),
                    FolderParentEntity.Vendor => await context.GetSet<Novologs.Domain.Entities.Vendor>()
                        .AnyAsync(v => v.Id == entityId, ct),
                    FolderParentEntity.Contract => await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                        .AnyAsync(c => c.Id == entityId, ct),
                    FolderParentEntity.Folder => await context.GetSet<Novologs.Domain.Entities.Folder>()
                        .AnyAsync(f => f.Id == entityId && !f.IsFile, ct),
                    FolderParentEntity.Task => await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                        .AnyAsync(t => t.Id == entityId, ct),
                    FolderParentEntity.Document => await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                        .AnyAsync(d => d.Id == entityId, ct),
                    _ => false,
                };
            })
            .When(v => v.EntityType != FolderParentEntity.None && v.EntityId != null)
            .WithMessage("Invalid EntityId for the specified EntityType.");
    }
}