using Finbuckle.MultiTenant.Abstractions;
using Novologs.Application.Modules.Folder.Folders.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Tenant;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Commands.AddFolder;

public record AddFolderCommand : IRequest<Result<AddFolderResponse>>
{
    public string Name { get; set; } = null!;
    public IFormFile? File { get; set; }

    public Guid? ParentFolderId { get; set; }
    public string? ParentFolderPath { get; set; }

    public FolderParentEntity EntityType { get; set; } = FolderParentEntity.None;
    public Guid? EntityId { get; set; }
    public Guid? ChatRoomId { get; set; }
    public Guid? DocumentNodeId { get; set; }
    public List<FolderMemberDto>? Members { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddFolderCommand, Novologs.Domain.Entities.Folder>()
                .ForMember(dest => dest.IsFile, opt => opt.MapFrom(src => src.File != null))
                .ForMember(dest => dest.ProjectId,
                    opt => opt.MapFrom(src => src.EntityType == FolderParentEntity.Project ? src.EntityId : null))
                .ForMember(dest => dest.MissionId,
                    opt => opt.MapFrom(src => src.EntityType == FolderParentEntity.Mission ? src.EntityId : null))
                .ForMember(dest => dest.MilestoneId,
                    opt => opt.MapFrom(src => src.EntityType == FolderParentEntity.Milestone ? src.EntityId : null))
                .ForMember(dest => dest.ClientId,
                    opt => opt.MapFrom(src => src.EntityType == FolderParentEntity.Client ? src.EntityId : null))
                .ForMember(dest => dest.LeadId,
                    opt => opt.MapFrom(src => src.EntityType == FolderParentEntity.Lead ? src.EntityId : null))
                .ForMember(dest => dest.VendorId,
                    opt => opt.MapFrom(src => src.EntityType == FolderParentEntity.Vendor ? src.EntityId : null))
                .ForMember(dest => dest.ContractId,
                    opt => opt.MapFrom(src => src.EntityType == FolderParentEntity.Contract ? src.EntityId : null))
                .ForMember(dest => dest.TaskId,
                    opt => opt.MapFrom(src => src.EntityType == FolderParentEntity.Task ? src.EntityId : null))
                .ForMember(dest => dest.ChatRoomId,
                    opt => opt.MapFrom(src => src.ChatRoomId ?? (src.EntityType == FolderParentEntity.Chat ? src.EntityId : null)))
                .ForMember(dest => dest.DocumentNodeId,
                    opt => opt.MapFrom(src => src.DocumentNodeId ?? (src.EntityType == FolderParentEntity.Document ? src.EntityId : null)))
                // When EntityType = Folder, treat EntityId as ParentFolderId.
                // Explicit ParentFolderId always takes precedence.
                .ForMember(dest => dest.ParentFolderId,
                    opt => opt.MapFrom(src => src.ParentFolderId ??
                                             (src.EntityType == FolderParentEntity.Folder ? src.EntityId : null)))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.IsFile, opt => opt.MapFrom(src => src.File != null))
                ;
        }
    }
}

public class AddFolderResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string? MimeType { get; set; }
    public long? Size { get; set; }
    public string? Url { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Folder, AddFolderResponse>();
        }
    }
}

public class AddFolderCommandHandler : IRequestHandler<AddFolderCommand, Result<AddFolderResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IConfiguration _configuration;
    private readonly IFileUtileService _fileUtileService;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public AddFolderCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        IConfiguration configuration,
        IFileUtileService fileUtileService,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _configuration = configuration;
        _fileUtileService = fileUtileService;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<AddFolderResponse>> Handle(AddFolderCommand request, CancellationToken cancellationToken)
    {
        //TODO check for users quota
        if (_user.Id == null)
        {
            return Result<AddFolderResponse>.Failure("Folder_001", "User not authenticated.");
        }

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<AddFolderResponse>.Failure("Folder_002", "Invalid user ID format.");
        }

        var entity = new Novologs.Domain.Entities.Folder();
        entity = _mapper.Map<Novologs.Domain.Entities.Folder>(request);

        // Inherit entity IDs from the parent folder regardless of whether the parent was
        // supplied via the explicit ParentFolderId field or via EntityType=Folder+EntityId
        // (the mapper copies EntityId â†’ entity.ParentFolderId in that case).
        var parentLookupId = request.ParentFolderId ?? entity.ParentFolderId;
        if (parentLookupId.HasValue)
        {
            var parent = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .FirstOrDefaultAsync(l => l.Id == parentLookupId, cancellationToken);
            if (parent != null)
            {
                // Prefer the parent's entity IDs when set; fall back to what was already set
                // via EntityType/EntityId so we never overwrite a valid ID with null.
                entity.ProjectId = parent.ProjectId ?? entity.ProjectId;
                entity.MissionId = parent.MissionId ?? entity.MissionId;
                entity.MilestoneId = parent.MilestoneId ?? entity.MilestoneId;
                entity.ClientId = parent.ClientId ?? entity.ClientId;
                entity.LeadId = parent.LeadId ?? entity.LeadId;
                entity.VendorId = parent.VendorId ?? entity.VendorId;
                entity.ContractId = parent.ContractId ?? entity.ContractId;
                entity.TaskId = parent.TaskId ?? entity.TaskId;
            }
        }

        entity.CreatorId = userId;

        if (request.File != null)
        {
            try
            {
                string storageFolder;
                if (entity.TaskId.HasValue)
                    storageFolder = $"Tasks/{entity.TaskId}";
                else if (entity.ProjectId.HasValue)
                    storageFolder = $"Projects/{entity.ProjectId}";
                else if (entity.MissionId.HasValue)
                    storageFolder = $"Missions/{entity.MissionId}";
                else if (entity.MilestoneId.HasValue)
                    storageFolder = $"Milestones/{entity.MilestoneId}";
                else if (entity.ClientId.HasValue)
                    storageFolder = $"Clients/{entity.ClientId}";
                else if (entity.LeadId.HasValue)
                    storageFolder = $"Leads/{entity.LeadId}";
                else if (entity.VendorId.HasValue)
                    storageFolder = $"Vendors/{entity.VendorId}";
                else if (entity.ContractId.HasValue)
                    storageFolder = $"Contracts/{entity.ContractId}";
                else if (request.EntityType == FolderParentEntity.Chat || request.ChatRoomId.HasValue)
                    storageFolder = entity.ChatRoomId.HasValue ? $"Chat/{entity.ChatRoomId}" : $"Chat";
                else if (request.EntityType == FolderParentEntity.Document || request.DocumentNodeId.HasValue)
                    storageFolder = entity.DocumentNodeId.HasValue ? $"Documents/{entity.DocumentNodeId}" : $"Documents";
                else
                {
                    // If an explicit parent folder was provided but has no entity association,
                    // store the file under that folder's own storage path instead of Personal.
                    if (entity.ParentFolderId.HasValue)
                    {
                        storageFolder = $"Folders/{entity.ParentFolderId}";
                    }
                    else
                    {
                        storageFolder = $"Personal/{userId}";

                        // Lazy: find or create the user's photo folder under System â†’ Users on first upload
                        var userPhotoFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                            .Include(f => f.ParentFolder)
                            .FirstOrDefaultAsync(f => f.CreatorId == userId
                                                   && f.Type == FolderType.Normal
                                                   && f.ParentFolder != null
                                                   && f.ParentFolder.Type == FolderType.General
                                                   && f.ParentFolder.Name == Constants.FolderNames.Users, cancellationToken);

                        if (userPhotoFolder == null)
                        {
                            var systemUsersFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                                .Include(f => f.ParentFolder)
                                .FirstOrDefaultAsync(f => f.Type == FolderType.General
                                                       && f.Name == Constants.FolderNames.Users
                                                       && f.ParentFolder != null
                                                       && f.ParentFolder.Name == Constants.System, cancellationToken);

                            if (systemUsersFolder != null)
                            {
                                var currentUser = await _context.GetSet<TenantUser>()
                                    .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

                                userPhotoFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
                                {
                                    Name = currentUser?.FullName ?? currentUser?.UserName ?? userId.ToString(),
                                    Type = FolderType.Normal,
                                    ParentFolderId = systemUsersFolder.Id,
                                    IsFile = false,
                                    CreatorId = userId
                                };
                                _context.GetSet<Novologs.Domain.Entities.Folder>().Add(userPhotoFolder);
                                await _context.SaveChangesAsync(cancellationToken);

                                if (currentUser != null)
                                {
                                    currentUser.FolderId = userPhotoFolder.Id;
                                    await _context.SaveChangesAsync(cancellationToken);
                                }
                            }
                        }

                        if (userPhotoFolder != null)
                        {
                            entity.ParentFolderId = userPhotoFolder.Id;
                        }
                    }
                }

                var upFile = await _fileUtileService.UploadFile(request.File, storageFolder);
                if (string.IsNullOrWhiteSpace(upFile.Url))
                {
                    upFile.Url = _configuration.GetSection("DefaultHttpSchema").Get<string>() +
                                 _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier + "." +
                                 _configuration.GetSection("DefaultDomain").Get<string>() +
                                 $"/Folder/getFile/{entity.Id}";
                }

                entity.MimeType = upFile.MimeType;
                entity.Size = upFile.Size;
                entity.Path = upFile.Path;
                entity.Url = upFile.Url;
            }
            catch (Exception ex)
            {
                return Result<AddFolderResponse>.Failure("Folder_004", $"File upload failed: {ex.Message}");
            }
        }

        if (request.Members != null && request.Members.Any())
        {
            foreach (var member in request.Members)
            {
                entity.Shares.Add(new Novologs.Domain.Entities.Share()
                {
                    FolderId = entity.Id,
                    SharedByUserId = userId,
                    SharedWithUserId = member.Id,
                    PermissionLevel = member.FolderSharePermissionLevel
                });
            }

            var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
            var membersIds = request.Members.Select(ms => ms.Id).Where(id => id != userId).ToList();

            if (membersIds.Any())
            {
                var notificationData = new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = membersIds,
                    Type = NotificationType.AddedToFolder,
                    Title = $"Folder Shared {entity.Name}",
                    Body =
                        $"A folder '{entity.Name}' has been shared with you.",
                    Data = new Dictionary<string, string>()
                };
                notificationData.Data.Add("FolderId", entity.Id.ToString());
                _sendEmailAndNotificationService.SendNotification(notificationData);
            }
        }

        Novologs.Domain.Entities.Folder? parentFolder = null;
        if (entity.ParentFolderId == null)
        {
            if (entity.ProjectId.HasValue)
            {
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.ProjectId == entity.ProjectId && f.Type == FolderType.Shared,
                        cancellationToken);
            }
            else if (entity.MissionId.HasValue)
            {
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.MissionId == entity.MissionId && f.Type == FolderType.Shared,
                        cancellationToken);
            }
            else if (entity.MilestoneId.HasValue)
            {
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.MilestoneId == entity.MilestoneId && f.Type == FolderType.Shared,
                        cancellationToken);
            }
            else if (entity.ClientId.HasValue)
            {
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.ClientId == entity.ClientId && f.Type == FolderType.Shared,
                        cancellationToken);
            }
            else if (entity.LeadId.HasValue)
            {
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.LeadId == entity.LeadId && f.Type == FolderType.Shared,
                        cancellationToken);
            }
            else if (entity.VendorId.HasValue)
            {
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.VendorId == entity.VendorId && f.Type == FolderType.Shared,
                        cancellationToken);
            }
            else if (entity.ContractId.HasValue)
            {
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.ContractId == entity.ContractId && f.Type == FolderType.Shared,
                        cancellationToken);
            }
            else if (entity.TaskId.HasValue)
            {
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(
                        f => f.TaskId == entity.TaskId && !f.IsFile &&
                             (f.Type == FolderType.SystemGenerated || f.Type == FolderType.Shared),
                        cancellationToken);

                // Lazily create the task's system-generated folder if it was never created
                // (e.g. tasks that existed before folder auto-creation was introduced).
                if (parentFolder == null)
                {
                    var generalTasksFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                        .Where(f => f.Type == FolderType.General && f.Name == Constants.FolderNames.Tasks)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (generalTasksFolder != null)
                    {
                        var taskSerial = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                            .Where(t => t.Id == entity.TaskId.Value)
                            .Select(t => (long?)t.Serial)
                            .FirstOrDefaultAsync(cancellationToken);

                        parentFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
                        {
                            Name = taskSerial?.ToString() ?? entity.TaskId.Value.ToString(),
                            Type = FolderType.SystemGenerated,
                            ParentFolderId = generalTasksFolder.Id,
                            IsFile = false,
                            CreatorId = entity.CreatorId,
                            TaskId = entity.TaskId.Value
                        };
                        _context.GetSet<Novologs.Domain.Entities.Folder>().Add(parentFolder);
                    }
                }
            }
            else if (request.EntityType == FolderParentEntity.Chat || request.ChatRoomId.HasValue)
            {
                // Route chat files under the "System Generated â†’ Chat" folder.
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .Include(f => f.ParentFolder)
                    .FirstOrDefaultAsync(f => f.Type == FolderType.General
                                           && f.Name == Constants.FolderNames.Chat
                                           && f.ParentFolder != null
                                           && f.ParentFolder.Name == Constants.System, cancellationToken);
            }
            else if (request.EntityType == FolderParentEntity.Document || request.DocumentNodeId.HasValue)
            {
                // Route document files under the "System Generated â†’ Documents" folder.
                parentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .Include(f => f.ParentFolder)
                    .FirstOrDefaultAsync(f => f.Type == FolderType.General
                                           && f.Name == Constants.FolderNames.Documents
                                           && f.ParentFolder != null
                                           && f.ParentFolder.Name == Constants.System, cancellationToken);
            }
            else //default to General Folder
            {
                var generalFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(
                        f => f.Name == "General" && f.CreatorId == userId && f.ParentFolderId == null,
                        cancellationToken);
                if (generalFolder == null)
                {
                    generalFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
                    {
                        Name = "General",
                        Type = FolderType.Normal,
                        ParentFolderId = null,
                        IsFile = false,
                        CreatorId = userId
                    };

                    await _context.GetSet<Novologs.Domain.Entities.Folder>().AddAsync(generalFolder, cancellationToken);
                }

                parentFolder = generalFolder;
            }

            //TODO Debug
            if (!string.IsNullOrEmpty(request.ParentFolderPath))
            {
                Guid? currentParentId = parentFolder?.Id;
                Novologs.Domain.Entities.Folder? currentParentFolder = parentFolder;
                var folderNames = request.ParentFolderPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
                if (folderNames.Length > 0)
                {
                    for (int i = 0; i < folderNames.Length; i++)
                    {
                        var folderName = folderNames[i];

                        // Check locally tracked (unsaved) folders first before hitting the DB
                        currentParentFolder = _context.GetSet<Novologs.Domain.Entities.Folder>().Local
                            .FirstOrDefault(f => f.Name == folderName && f.ParentFolderId == currentParentId && !f.IsDeleted);

                        if (currentParentFolder == null)
                        {
                            currentParentFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                                .Where(f => f.Name == folderName && f.ParentFolderId == currentParentId)
                                .FirstOrDefaultAsync(cancellationToken);
                        }

                        if (currentParentFolder == null)
                        {
                            var newFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
                            {
                                Name = folderName,
                                Type = FolderType.Normal,
                                ParentFolderId = currentParentId,
                                IsFile = false,
                                CreatorId = userId
                            };
                            _context.GetSet<Novologs.Domain.Entities.Folder>().Add(newFolder);
                            // SaveChangesAsync deferred to end â€” ID already set via Guid.NewGuid()
                            currentParentFolder = newFolder;
                        }

                        currentParentId = currentParentFolder.Id;
                    }

                    entity.ParentFolderId = currentParentId;
                    if (currentParentFolder != null)
                    {
                        entity.ProjectId = currentParentFolder.ProjectId;
                        entity.MissionId = currentParentFolder.MissionId;
                        entity.MilestoneId = currentParentFolder.MilestoneId;
                        entity.ClientId = currentParentFolder.ClientId;
                        entity.LeadId = currentParentFolder.LeadId;
                        entity.VendorId = currentParentFolder.VendorId;
                        entity.ContractId = currentParentFolder.ContractId;
                        entity.TaskId = currentParentFolder.TaskId;
                    }
                }
            }
            else
            {
                entity.ParentFolderId = parentFolder?.Id;
            }
        }


        _context.GetSet<Novologs.Domain.Entities.Folder>().Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<AddFolderResponse>(entity);
        return Result<AddFolderResponse>.Success(response);
    }
}
