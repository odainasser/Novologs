using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using Finbuckle.MultiTenant.Abstractions;
using MessageTemplates.Services;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Helpers;

namespace Novologs.Application.Modules.Client.Leads.Commands.RemoveLeadMember;

public record RemoveLeadMemberCommand : IRequest<Result<bool>>
{
    public Guid LeadId { get; set; }
    public Guid MemberId { get; set; }
}

public class RemoveLeadMemberCommandValidator : AbstractValidator<RemoveLeadMemberCommand>
{
    public RemoveLeadMemberCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.LeadId)
            .NotEmpty().WithMessage("Lead ID is required.");

        RuleFor(v => v.MemberId)
            .NotEmpty().WithMessage("Member ID is required.");

        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {
                return await context.GetSet<LeadMember>()
                    .AnyAsync(lm => lm.LeadId == command.LeadId 
                                    && lm.MemberId == command.MemberId 
                                    && !lm.IsDeleted, 
                        cancellationToken);
            }).WithMessage("Lead member not found.");
    }
}

public class RemoveLeadMemberCommandHandler : IRequestHandler<RemoveLeadMemberCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public RemoveLeadMemberCommandHandler(
        ITenantDbContext context,
        INotificationService notificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor)
    {
        _context = context;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<bool>> Handle(RemoveLeadMemberCommand request, CancellationToken cancellationToken)
    {
        var leadMember = await _context.GetSet<LeadMember>()
            .Include(lm => lm.Lead)
            .FirstOrDefaultAsync(lm => lm.LeadId == request.LeadId 
                                       && lm.MemberId == request.MemberId 
                                       && !lm.IsDeleted, 
                cancellationToken);

        if (leadMember == null)
            return Result<bool>.Failure("Lead_007", "Lead member not found.");

        // Soft delete the member
        leadMember.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);

        // Check if lead still has any active members
        var hasActiveMembers = await _context.GetSet<LeadMember>()
            .AnyAsync(lm => lm.LeadId == request.LeadId && !lm.IsDeleted, cancellationToken);

        // Update IsShared flag if no more active members
        if (!hasActiveMembers)
        {
            leadMember.Lead.IsShared = false;
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Send notification to the removed member
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        
        await _notificationService.SendNotificationWithUserLanguages(
            _context,
            MessageType.LeadMemberRemoved,
            tenantInfo?.Id,
            new List<Guid> { request.MemberId },
            new
            {
                LeadName = leadMember.Lead.Name,
                LeadId = leadMember.Lead.Id.ToString(),
                LeadCode = leadMember.Lead.Code ?? string.Empty
            },
            cancellationToken);

        return Result<bool>.Success(true);
    }
}
