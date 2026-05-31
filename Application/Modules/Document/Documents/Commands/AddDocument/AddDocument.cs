using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Helpers;
using System.Collections.Generic;
using Novologs.Application.Modules.Document.Documents.Commands;
using Finbuckle.MultiTenant.Abstractions;
using Novologs.Domain.Enums;
using MessageTemplates.Services;
using Novologs.Domain.Entities;
using SystemLoaders.Services;
using Novologs.Application.Tenant;

namespace Novologs.Application.Modules.Document.Documents.Commands.AddDocument;

public record AddDocumentCommand : IRequest<Result<AddDocumentResponse>>
{
    public Novologs.Domain.Enums.DocumentNodeType Type { get; set; }
    public Novologs.Domain.Enums.DocumentNodeVisibility Visibiltiy { get; set; }
    public Novologs.Domain.Enums.DocumentNodeStatus Status { get; set; }
    public Guid? ParentDocumentId { get; set; }
    public Guid? DocumentCategoryId { get; set; }
    public List<DocumentMemberInputDto>? Members { get; set; } = new();
    public DocumentVersionInputDto DocumentContent { get; set; } = null!;

    public Guid? TaskId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? MileStoneId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? ClientLeadId { get; set; }
    public Guid? VendorId { get; set; }
    public Guid? VendorContractId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddDocumentCommand, Novologs.Domain.Entities.DocumentNode>()
                .ForMember(dest => dest.Members, opt => opt.Ignore())
                .ForMember(dest => dest.DocumentVersionList, opt => opt.Ignore());
        }
    }
}

public class AddDocumentResponse
{
    public Guid Id { get; set; }
}

public class AddDocumentCommandHandler : IRequestHandler<AddDocumentCommand, Result<AddDocumentResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public AddDocumentCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        INotificationService notificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<AddDocumentResponse>> Handle(AddDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var document = _mapper.Map<Novologs.Domain.Entities.DocumentNode>(request);
        document.CreatorId = Guid.Parse(_user.Id!);
        document.CommentThread = new();

        if (request.DocumentContent != null)
        {
            var documentVersion = _mapper.Map<Novologs.Domain.Entities.DocumentVersion>(request.DocumentContent);
            document.DocumentVersionList.Add(documentVersion);

            if (request.DocumentContent.FilesIds != null)
            {
                foreach (var fileId in request.DocumentContent.FilesIds)
                {
                    documentVersion.Files.Add(new Novologs.Domain.Entities.DocumentFile() { FileId = fileId });
                }
            }
        }

        request.Members ??= new List<DocumentMemberInputDto>();
        var creatorMember = request.Members.FirstOrDefault(m => m.MemberId == document.CreatorId);
        if (creatorMember == null)
        {
            creatorMember = new DocumentMemberInputDto()
            {
                MemberId = document.CreatorId.Value, Role = Novologs.Domain.Enums.DocumentMemeberRole.Editor
            };
            request.Members.Add(creatorMember);
        }
        else
        {
            creatorMember.Role = Novologs.Domain.Enums.DocumentMemeberRole.Editor;
        }

        if (request.Members != null)
        {
            foreach (var memberDto in request.Members)
            {
                document.Members.Add(_mapper.Map<Novologs.Domain.Entities.DocumentNodeMember>(memberDto));
            }
        }

        _context.GetSet<Novologs.Domain.Entities.DocumentNode>().Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        var documentsRootName = Constants.FolderRootMapping[Constants.FolderNames.Documents];
        var documentsRootFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f =>
                    f.Type == Novologs.Domain.Enums.FolderType.General
                    && f.Name == documentsRootName
                    && f.ParentFolderId == null
                , cancellationToken);

        var generalDocumentsFolder = documentsRootFolder != null
            ? await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .FirstOrDefaultAsync(f =>
                        f.Name == Constants.FolderNames.Documents
                        && f.ParentFolderId == documentsRootFolder.Id
                    , cancellationToken)
            : null;

        if (generalDocumentsFolder != null)
        {
            var documentFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
            {
                Name = document.Id.ToString(),
                Type = Novologs.Domain.Enums.FolderType.SystemGenerated,
                ParentFolderId = generalDocumentsFolder.Id,
                IsFile = false,
                CreatorId = document.CreatorId.Value,
            };
            await _context.GetSet<Novologs.Domain.Entities.Folder>().AddAsync(documentFolder, cancellationToken);
            document.FolderId = documentFolder.Id;
            await _context.SaveChangesAsync(cancellationToken);
        }

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var membersIds = document.Members.Select(ms => ms.MemberId).ToList();

        var mentionedMembersIds = document.Members.Where(m => m.IsMention).Select(m => m.MemberId).ToList();
        var otherMembersIds = membersIds.Except(mentionedMembersIds).ToList();

        if (mentionedMembersIds.Any())
        {
            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.DocumentMentioned,
                tenantInfo?.Id,
                mentionedMembersIds,
                new { DocumentSerial = document.Serial.ToString(), DocumentId = document.Id.ToString() },
                cancellationToken
            );
        }

        if (otherMembersIds.Any())
        {
            //var otherNotificationData = new NotificationData()
            //{
            //    TenantId = tenantInfo?.Id,
            //    UserIds = otherMembersIds,
            //    Type = NotificationType.AddedToDocument,
            //    Title = $"New Document Created {document.Serial}",
            //    Body =
            //        $"A new document '{document.Serial}' has been created. You have been added as a member of this document.",
            //    Data = new Dictionary<string, string>()
            //};
            //otherNotificationData.Data.Add("DocumentSerial", document.Serial.ToString());
            //otherNotificationData.Data.Add("DocumentId", document.Id.ToString());
            //_notificationService.SendNotification(otherNotificationData);
            
            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.DocumentCreated,
                tenantInfo?.Id,
                otherMembersIds,
                new { DocumentSerial = document.Serial.ToString(), DocumentId = document.Id.ToString() },
                cancellationToken
            );
            
        }

        return Result<AddDocumentResponse>.Success(new AddDocumentResponse() { Id = document.Id });
    }
}
