using Finbuckle.MultiTenant.Abstractions;
using Novologs.Application.Modules.Folder.Folders.Dto;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Commands.UpdateFolder;

public record UpdateFolderCommand : IRequest<Result<UpdateFolderResponse>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public List<FolderMemberDto>? Members { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateFolderCommand, Novologs.Domain.Entities.Folder>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null))
                ;
        }
    }
}

public class UpdateFolderResponse
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
            CreateMap<Novologs.Domain.Entities.Folder, UpdateFolderResponse>();
        }
    }
}

public class UpdateFolderCommandHandler : IRequestHandler<UpdateFolderCommand, Result<UpdateFolderResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IConfiguration _configuration;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public UpdateFolderCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        IConfiguration configuration,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _configuration = configuration;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<UpdateFolderResponse>> Handle(UpdateFolderCommand request,
        CancellationToken cancellationToken)
    {
        if (_user.Id == null)
        {
            return Result<UpdateFolderResponse>.Failure("Folder_008", "User not authenticated.");
        }

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<UpdateFolderResponse>.Failure("Folder_009", "Invalid user ID format.");
        }

        var folder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .Include(f => f.Shares)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (folder == null)
        {
            return Result<UpdateFolderResponse>.Failure("Folder_007", "Folder not found.");
        }

        _mapper.Map(request, folder);

        if (request.Members != null && request.Members.Any())
        {
            var existingShares = folder.Shares.ToList();
            var updatedMemberIds = request.Members.Select(m => m.Id).ToList();

            foreach (var share in existingShares)
            {
                if (!updatedMemberIds.Contains(share.SharedWithUserId))
                {
                    _context.GetSet<Novologs.Domain.Entities.Share>().Remove(share);
                    var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
                    var membersIds = new List<Guid>() { share.SharedWithUserId };

                    if (membersIds.Any())
                    {
                        var notificationData = new NotificationData()
                        {
                            TenantId = tenantInfo?.Id,
                            UserIds = membersIds,
                            Type = NotificationType.RemovedFromFolder,
                            Title = $"Folder Access Removed {folder.Name}",
                            Body =
                                $"Your access to the folder '{folder.Name}' has been removed.",
                            Data = new Dictionary<string, string>()
                        };
                        notificationData.Data.Add("FolderId", folder.Id.ToString());
                        _sendEmailAndNotificationService.SendNotification(notificationData);
                    }
                }
            }

            foreach (var memberDto in request.Members)
            {
                var existingShare = existingShares.FirstOrDefault(s => s.SharedWithUserId == memberDto.Id);
                if (existingShare == null)
                {
                    _context.GetSet<Novologs.Domain.Entities.Share>().Add(new Novologs.Domain.Entities.Share
                    {
                        FolderId = folder.Id,
                        SharedByUserId = userId,
                        SharedWithUserId = memberDto.Id,
                        PermissionLevel = memberDto.FolderSharePermissionLevel
                    });

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
                else
                {
                    existingShare.PermissionLevel = memberDto.FolderSharePermissionLevel;
                }
            }
        }

        _context.GetSet<Novologs.Domain.Entities.Folder>().Update(folder);
        await _context.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<UpdateFolderResponse>(folder);
        return Result<UpdateFolderResponse>.Success(response);
    }
}
