using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using Finbuckle.MultiTenant.Abstractions;
using MessageTemplates.Services;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Helpers;

namespace Novologs.Application.Modules.Client.Leads.Commands.TransferLeadOwnership;

public record TransferLeadOwnershipCommand : IRequest<Result<bool>>
{
    public Guid LeadId { get; set; }
    public Guid NewOwnerId { get; set; }
}

public class TransferLeadOwnershipCommandValidator : AbstractValidator<TransferLeadOwnershipCommand>
{
    public TransferLeadOwnershipCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.LeadId)
            .NotEmpty().WithMessage("Lead ID is required.")
            .MustAsync(async (leadId, cancellationToken) =>
            {
                return await context.GetSet<ClientLead>()
                    .AnyAsync(l => l.Id == leadId, cancellationToken);
            }).WithMessage("Lead not found.");

        RuleFor(v => v.NewOwnerId)
            .NotEmpty().WithMessage("New owner ID is required.")
            .MustAsync(async (ownerId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>()
                    .AnyAsync(u => u.Id == ownerId, cancellationToken);
            }).WithMessage("New owner not found.");
    }
}

public class TransferLeadOwnershipCommandHandler : IRequestHandler<TransferLeadOwnershipCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public TransferLeadOwnershipCommandHandler(
        ITenantDbContext context,
        IUser user,
        INotificationService notificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor)
    {
        _context = context;
        _user = user;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<bool>> Handle(TransferLeadOwnershipCommand request, CancellationToken cancellationToken)
    {
        var lead = await _context.GetSet<ClientLead>()
            .Include(l => l.LeadMembers)
            .FirstOrDefaultAsync(l => l.Id == request.LeadId, cancellationToken);

        if (lead == null)
            return Result<bool>.Failure("Lead_008", "Lead not found.");

        if (lead.CreatorId == request.NewOwnerId)
            return Result<bool>.Failure("Lead_010", "The user is already the owner of this lead.");

        var oldOwnerId = lead.CreatorId;

        // Transfer ownership
        lead.CreatorId = request.NewOwnerId;

        // Remove new owner from members list if they were a member
        var existingMembership = lead.LeadMembers
            .FirstOrDefault(lm => lm.MemberId == request.NewOwnerId && !lm.IsDeleted);
        
        if (existingMembership != null)
        {
            existingMembership.IsDeleted = true;
        }

        // Add old owner as a member with full permissions (except ManageMembers)
        var oldOwnerAsMember = lead.LeadMembers
            .FirstOrDefault(lm => lm.MemberId == oldOwnerId && !lm.IsDeleted);
        
        if (oldOwnerAsMember == null)
        {
            var newMember = new LeadMember
            {
                LeadId = request.LeadId,
                MemberId = oldOwnerId,
                PermissionLevel = Novologs.Domain.Enums.LeadMemberPermission.View | 
                                  Novologs.Domain.Enums.LeadMemberPermission.Update | 
                                  Novologs.Domain.Enums.LeadMemberPermission.ChangeStatus
            };
            await _context.GetSet<LeadMember>().AddAsync(newMember, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Notify both old and new owners
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        
        await _notificationService.SendNotificationWithUserLanguages(
            _context,
            MessageType.LeadOwnershipTransferred,
            tenantInfo?.Id,
            new List<Guid> { request.NewOwnerId, oldOwnerId },
            new
            {
                LeadName = lead.Name,
                LeadId = lead.Id.ToString(),
                LeadCode = lead.Code ?? string.Empty,
                OldOwnerId = oldOwnerId.ToString(),
                NewOwnerId = request.NewOwnerId.ToString()
            },
            cancellationToken);

        return Result<bool>.Success(true);
    }
}
