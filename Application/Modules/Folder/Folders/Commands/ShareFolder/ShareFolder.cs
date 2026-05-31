using Finbuckle.MultiTenant.Abstractions;
using Novologs.Application.Modules.Folder.Folders.Dto;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Commands.ShareFolder;

public record ShareFolderCommand : IRequest<Result<ShareFolderResponse>>
{
    public Guid Id { get; set; }

    public List<FolderMemberDto>? Members { get; set; }
}

public class ShareFolderResponse
{
}

public class ShareFolderCommandHandler : IRequestHandler<ShareFolderCommand, Result<ShareFolderResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IConfiguration _configuration;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public ShareFolderCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        IConfiguration configuration,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _configuration = configuration;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<ShareFolderResponse>> Handle(ShareFolderCommand request,
        CancellationToken cancellationToken)
    {
        if (_user.Id == null)
        {
            return Result<ShareFolderResponse>.Failure("Folder_010", "User not authenticated.");
        }

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<ShareFolderResponse>.Failure("Folder_011", "Invalid user ID format.");
        }

        var folder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .Include(f => f.Shares)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (folder == null)
        {
            return Result<ShareFolderResponse>.Failure("Folder_012", "Folder not found.");
        }

        if (request.Members != null && request.Members.Any())
        {
            var existingShares = folder.Shares.ToList();
            var updatedMemberIds = request.Members.Select(m => m.Id).ToList();

            foreach (var memberDto in request.Members)
            {
                var existingShare = existingShares.FirstOrDefault(s => s.SharedWithUserId == memberDto.Id);
                if (existingShare == null)
                {
                    _context.GetSet<Novologs.Domain.Entities.Share>().Add(new()
                    {
                        FolderId = folder.Id,
                        SharedByUserId = userId,
                        SharedWithUserId = memberDto.Id,
                        PermissionLevel = memberDto.FolderSharePermissionLevel
                    });
                }
                else if (existingShare.PermissionLevel != FolderSharePermissionLevel.CanReshare)
                {
                    existingShare.PermissionLevel = memberDto.FolderSharePermissionLevel;
                }
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
                    Title = $"Folder Shared {folder.Name}",
                    Body =
                        $"A folder '{folder.Name}' has been shared with you.",
                    Data = new Dictionary<string, string>()
                };
                notificationData.Data.Add("FolderId", folder.Id.ToString());
                _sendEmailAndNotificationService.SendNotification(notificationData);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<ShareFolderResponse>.Success(new ShareFolderResponse());
    }
}
