using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using Finbuckle.MultiTenant.Abstractions;
using MessageTemplates.Services;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Helpers;

namespace Novologs.Application.Modules.Client.Leads.Commands.ShareLeadWithMembers;

public record ShareLeadWithMembersCommand : IRequest<Result<bool>>
{
    public Guid LeadId { get; set; }
    public List<LeadMemberInput> Members { get; set; } = new();
}

public class LeadMemberInput
{
    public Guid MemberId { get; set; }
}

public class ShareLeadWithMembersCommandValidator : AbstractValidator<ShareLeadWithMembersCommand>
{
    public ShareLeadWithMembersCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.LeadId)
            .NotEmpty().WithMessage("Lead ID is required.")
            .MustAsync(async (leadId, cancellationToken) =>
            {
                return await context.GetSet<ClientLead>()
                    .AnyAsync(l => l.Id == leadId, cancellationToken);
            }).WithMessage("Lead not found.");

        RuleFor(v => v.Members)
            .NotEmpty().WithMessage("At least one member is required.");

        RuleForEach(v => v.Members).ChildRules(member =>
        {
            member.RuleFor(m => m.MemberId)
                .NotEmpty().WithMessage("Member ID is required.")
                .MustAsync(async (memberId, cancellationToken) =>
                {
                    return await context.GetSet<TenantUser>()
                        .AnyAsync(u => u.Id == memberId, cancellationToken);
                }).WithMessage("Member not found.");

        });
    }
}

public class ShareLeadWithMembersCommandHandler : IRequestHandler<ShareLeadWithMembersCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public ShareLeadWithMembersCommandHandler(
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

    public async Task<Result<bool>> Handle(ShareLeadWithMembersCommand request, CancellationToken cancellationToken)
    {
        var lead = await _context.GetSet<ClientLead>()
            .Include(l => l.LeadMembers)
            .FirstOrDefaultAsync(l => l.Id == request.LeadId, cancellationToken);

        if (lead == null)
            return Result<bool>.Failure("Lead_004", "Lead not found.");

        var requestedMemberIds = request.Members.Select(m => m.MemberId).ToList();
        
        var existingMembers = lead.LeadMembers
            .Where(lm => !lm.IsDeleted)
            .ToList();

        var existingMemberIds = existingMembers.Select(lm => lm.MemberId).ToList();

        // Find members to add (in request but not existing)
        var newMemberIds = requestedMemberIds.Except(existingMemberIds).ToList();

        // Find members to remove (existing but not in request)
        var removedMemberIds = existingMemberIds.Except(requestedMemberIds).ToList();

        // Add new members
        foreach (var memberId in newMemberIds)
        {
            var leadMember = new LeadMember
            {
                LeadId = request.LeadId,
                MemberId = memberId,
            };

            await _context.GetSet<LeadMember>().AddAsync(leadMember, cancellationToken);
        }

        // Remove members no longer in the list (soft delete)
        foreach (var existingMember in existingMembers.Where(m => removedMemberIds.Contains(m.MemberId)))
        {
            existingMember.IsDeleted = true;
        }

        // Mark lead as shared if it has members
        lead.IsShared = requestedMemberIds.Any();

        await _context.SaveChangesAsync(cancellationToken);

        // Send notifications to new members only
        if (newMemberIds.Any())
        {
            var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
            
            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.LeadMemberAdded,
                tenantInfo?.Id,
                newMemberIds,
                new
                {
                    LeadName = lead.Name,
                    LeadId = lead.Id.ToString(),
                    LeadCode = lead.Code ?? string.Empty
                },
                cancellationToken);
        }

        // Send notifications to removed members
        if (removedMemberIds.Any())
        {
            var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
            
            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.LeadMemberRemoved,
                tenantInfo?.Id,
                removedMemberIds,
                new
                {
                    LeadName = lead.Name,
                    LeadId = lead.Id.ToString(),
                    LeadCode = lead.Code ?? string.Empty
                },
                cancellationToken);
        }

        return Result<bool>.Success(true);
    }
}
