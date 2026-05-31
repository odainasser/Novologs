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

namespace Novologs.Application.Modules.Document.Documents.Commands.UpdateDocument;

public record UpdateDocumentCommand : IRequest<Result<UpdateDocumentResponse>>
{
    public Guid Id { get; set; }
    public string? CurrentVersion { get; set; }
    public string? Title { get; set; }
    public Novologs.Domain.Enums.DocumentNodeType? Type { get; set; }
    public Novologs.Domain.Enums.DocumentNodeVisibility? Visibiltiy { get; set; }
    public Novologs.Domain.Enums.DocumentNodeStatus? Status { get; set; }
    public Guid? ParentDocumentId { get; set; }
    public Guid? DocumentCategoryId { get; set; }

    public List<DocumentMemberUpdateDto>? Members { get; set; }
    public DocumentVersionInputDto? DocumentContent { get; set; }
    
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
            CreateMap<UpdateDocumentCommand, Novologs.Domain.Entities.DocumentNode>()
                .ForMember(dest => dest.Members, opt => opt.Ignore())
                .ForMember(dest => dest.DocumentVersionList, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}

public class UpdateDocumentResponse
{
}

public class UpdateDocumentCommandHandler : IRequestHandler<UpdateDocumentCommand, Result<UpdateDocumentResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public UpdateDocumentCommandHandler(
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

    public async Task<Result<UpdateDocumentResponse>> Handle(UpdateDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var document = _context.GetSet<Novologs.Domain.Entities.DocumentNode>()
            .Include(d => d.DocumentVersionList)
            .ThenInclude(v => v.Files)
            .Include(d => d.Members)
            .FirstOrDefault(d => d.Id == request.Id);
        if (document == null)
        {
            return Result<UpdateDocumentResponse>.Failure("Document_003", "Document not found");
        }

        _mapper.Map(request, document);
        if (request.DocumentContent != null)
        {
            if (request.DocumentContent.Id.HasValue)
            {
                //update already exist version
                var existingVersion =
                    document.DocumentVersionList.FirstOrDefault(v => v.Id == request.DocumentContent.Id);
                if (existingVersion != null)
                {
                    _mapper.Map(request.DocumentContent, existingVersion);
                    if (request.DocumentContent.FilesIds != null)
                    {
                        // Remove files not in the request
                        var filesToRemove = existingVersion.Files
                            .Where(f => !request.DocumentContent.FilesIds.Contains(f.FileId))
                            .ToList();
                        foreach (var fileToRemove in filesToRemove)
                        {
                            _context.GetSet<Novologs.Domain.Entities.DocumentFile>().Remove(fileToRemove);
                        }

                        // Add new files
                        var existingFileIds = existingVersion.Files.Select(f => f.FileId).ToList();
                        foreach (var fileId in request.DocumentContent.FilesIds)
                        {
                            if (!existingFileIds.Contains(fileId))
                            {
                                _context.GetSet<Novologs.Domain.Entities.DocumentFile>().Add(
                                    new Novologs.Domain.Entities.DocumentFile()
                                    {
                                        DocumentVersionId = existingVersion.Id, FileId = fileId
                                    });
                            }
                        }
                    }
                }
            }
            else
            {
                var documentVersion = _mapper.Map<Novologs.Domain.Entities.DocumentVersion>(request.DocumentContent);
                documentVersion.NodeId = document.Id;
                _context.GetSet<Novologs.Domain.Entities.DocumentVersion>().Add(documentVersion);

                if (request.DocumentContent.FilesIds != null)
                {
                    foreach (var fileId in request.DocumentContent.FilesIds)
                    {
                        _context.GetSet<Novologs.Domain.Entities.DocumentFile>().Add(
                            new Novologs.Domain.Entities.DocumentFile()
                            {
                                DocumentVersionId = documentVersion.Id, FileId = fileId
                            });
                    }
                }
            }
        }

        if (request.Members != null)
        {
            // Remove members not in the request
            var membersToRemove = document.Members
                .Where(m => !request.Members.Any(rm => rm.Id == m.Id))
                .ToList();
            foreach (var memberToRemove in membersToRemove)
            {
                _context.GetSet<Novologs.Domain.Entities.DocumentNodeMember>().Remove(memberToRemove);
            }

            // Add or update members
            foreach (var memberDto in request.Members)
            {
                var existingMember = document.Members.FirstOrDefault(m => m.Id == memberDto.Id);
                if (existingMember == null)
                {
                    var newMember = _mapper.Map<Novologs.Domain.Entities.DocumentNodeMember>(memberDto);
                    newMember.NodeId = document.Id;
                    _context.GetSet<Novologs.Domain.Entities.DocumentNodeMember>().Add(newMember);
                }
                else
                {
                    _mapper.Map(memberDto, existingMember);
                }
            }
        }

        _context.GetSet<Novologs.Domain.Entities.DocumentNode>().Update(document);
        await _context.SaveChangesAsync(cancellationToken);
        
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
            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.DocumentUpdated,
                tenantInfo?.Id,
                otherMembersIds,
                new { DocumentSerial = document.Serial.ToString(), DocumentId = document.Id.ToString() },
                cancellationToken
            );
        }

        return Result<UpdateDocumentResponse>.Success(new UpdateDocumentResponse());
    }
}
