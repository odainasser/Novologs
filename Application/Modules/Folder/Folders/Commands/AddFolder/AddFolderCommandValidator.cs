using Novologs.Application.Modules.Folder.Folders.Dto;
using Microsoft.Extensions.Configuration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Commands.AddFolder;

public class AddFolderCommandValidator : AbstractValidator<AddFolderCommand>
{
    public AddFolderCommandValidator(ITenantDbContext context, IUser user, IConfiguration configuration)
    {
    
        RuleFor(v => v.ParentFolderId)
            .MustAsync(async (id, ct) =>
            {
                if (id == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Folder>("")
                    .AnyAsync(l => l.Id == id, ct);
            })
            .WithMessage("'Parent Folder' must exist.");
        
        RuleFor(v => v.Name)
            .NotEmpty()
            .MaximumLength(200)
            .MustAsync(async (model, name, ct) =>
            {
                if (model.ParentFolderId != null)
                {
                    //if parent is not null, then names should be unique within the parent folder
                    return !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                        .AnyAsync(l => l.ParentFolderId == model.ParentFolderId && l.Name == name, ct);
                }

                // When uploading to a specific entity, scope uniqueness to that entity
                if (model.EntityId != null)
                {
                    return model.EntityType switch
                    {
                        FolderParentEntity.Task => !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.TaskId == model.EntityId && l.Name == name, ct),
                        FolderParentEntity.Project => !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.ProjectId == model.EntityId && l.Name == name, ct),
                        FolderParentEntity.Mission => !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.MissionId == model.EntityId && l.Name == name, ct),
                        FolderParentEntity.Milestone => !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.MilestoneId == model.EntityId && l.Name == name, ct),
                        FolderParentEntity.Client => !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.ClientId == model.EntityId && l.Name == name, ct),
                        FolderParentEntity.Lead => !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.LeadId == model.EntityId && l.Name == name, ct),
                        FolderParentEntity.Vendor => !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.VendorId == model.EntityId && l.Name == name, ct),
                        FolderParentEntity.Contract => !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.ContractId == model.EntityId && l.Name == name, ct),
                        FolderParentEntity.Chat => (model.ChatRoomId ?? model.EntityId) == null || !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.ChatRoomId == (model.ChatRoomId ?? model.EntityId) && l.Name == name, ct),
                        FolderParentEntity.Document => (model.DocumentNodeId ?? model.EntityId) == null || !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                            .AnyAsync(l => l.DocumentNodeId == (model.DocumentNodeId ?? model.EntityId) && l.Name == name, ct),
                        _ => true,
                    };
                }

                //if parent is null and no entity, then names should be unique only for the same user at root level
                Guid.TryParse(user.Id, out var userId);
                return !await context.GetSet<Novologs.Domain.Entities.Folder>("")
                    .AnyAsync(l => l.ParentFolderId == null && l.TaskId == null && l.ProjectId == null && l.MissionId == null &&
                                   l.MilestoneId == null && l.ClientId == null && l.LeadId == null &&
                                   l.VendorId == null && l.ContractId == null &&
                                   l.Name == name && l.CreatorId == userId, ct);
            })
            .WithMessage("'Name' must be unique.");

        RuleFor(v => v.EntityId)
            .NotEmpty()
            .When(v => v.EntityType != FolderParentEntity.None &&
                       v.EntityType != FolderParentEntity.All &&
                       v.EntityType != FolderParentEntity.MyShare &&
                       v.EntityType != FolderParentEntity.Chat &&
                       v.EntityType != FolderParentEntity.Document &&
                       v.EntityType != FolderParentEntity.Folder &&
                       v.EntityType != FolderParentEntity.DeletedItems)
            .WithMessage("EntityId is required when EntityType is specified.");

        RuleFor(v => v.ParentFolderId)
            .MustAsync(async (model, id, ct) =>
            {
                if (model.ParentFolderId == null) return true;
                var parent = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(l => l.Id == model.ParentFolderId, ct);
                if (parent == null) return true;
                return parent.Type == FolderType.Normal || parent.Type == FolderType.Shared;
            })
            .WithMessage("Can't write to this Folder.");
        RuleFor(v => v.File)
            .Must((model, file) =>
            {
                if (file == null) return true;
                var maxFileSize = configuration.GetValue<long>("MaxFileSize");
                return file.Length <= maxFileSize;
            })
            .WithMessage("File size exceeds the maximum allowed size.")
            .Must((model, file) =>
            {
                if (file == null) return true;
                var supportedFileTypes = configuration.GetSection("SupportedFileTypes").Get<string[]>();
                if (supportedFileTypes == null || !supportedFileTypes.Any()) return true;

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                return supportedFileTypes.Contains(fileExtension);
            })
            .WithMessage("File type is not supported.");
        RuleFor(v => v.Members)
            .MustAsync(async (members, cancellationToken) =>
            {
                if (members == null || !members.Any()) return true;
                var uniqueMemberIds = members.Select(m => m.Id).Distinct().ToList();

                var existingUsersCount = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .CountAsync(u => uniqueMemberIds.Contains(u.Id), cancellationToken);

                return existingUsersCount == uniqueMemberIds.Count;
            })
            .WithMessage("Invalid member(s) specified.");

        RuleFor(v => v)
            .MustAsync(async (model, cancellationToken) =>
            {
                if (model.EntityType == FolderParentEntity.None || model.EntityId == null) return true;

                switch (model.EntityType)
                {
                    case FolderParentEntity.Project:
                        return await context.GetSet<Novologs.Domain.Entities.Project>()
                            .AnyAsync(p => p.Id == model.EntityId, cancellationToken);
                    case FolderParentEntity.Mission:
                        return await context.GetSet<Novologs.Domain.Entities.Project>()
                            .AnyAsync(p => p.Id == model.EntityId && p.Type == ProjectType.Mission, cancellationToken);
                    case FolderParentEntity.Milestone:
                        return await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                            .AnyAsync(m => m.Id == model.EntityId, cancellationToken);
                    case FolderParentEntity.Client:
                        return await context.GetSet<Novologs.Domain.Entities.Client>()
                            .AnyAsync(c => c.Id == model.EntityId, cancellationToken);
                    case FolderParentEntity.Lead:
                        return await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                            .AnyAsync(l => l.Id == model.EntityId, cancellationToken);
                    case FolderParentEntity.Vendor:
                        return await context.GetSet<Novologs.Domain.Entities.Vendor>()
                            .AnyAsync(v => v.Id == model.EntityId, cancellationToken);
                    case FolderParentEntity.Contract:
                        return await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                            .AnyAsync(c => c.Id == model.EntityId, cancellationToken);
                    case FolderParentEntity.Task:
                        return await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                            .AnyAsync(t => t.Id == model.EntityId, cancellationToken);
                    case FolderParentEntity.Chat:
                        return await context.GetSet<Novologs.Domain.Entities.ChatRoom>()
                            .AnyAsync(c => c.Id == model.EntityId, cancellationToken);
                    case FolderParentEntity.Document:
                        return await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                            .AnyAsync(d => d.Id == model.EntityId, cancellationToken);
                    default:
                        return false;
                }
            })
            .WithMessage("Invalid Entity specified.");

        RuleFor(v => v)
            .Must(model => !(model.ParentFolderId.HasValue && !string.IsNullOrEmpty(model.ParentFolderPath)))
            .WithMessage("Cannot specify both ParentFolderId and ParentFolderPath.");
    }
}
