using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using Finbuckle.MultiTenant.Abstractions;
using MessageTemplates.Services;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Helpers;

namespace Novologs.Application.Modules.Client.Leads.Commands.UpdateLeadMemberPermission;

public record UpdateLeadMemberPermissionCommand : IRequest<Result<bool>>
{
    public Guid LeadId { get; set; }
    public Guid MemberId { get; set; }
    public LeadMemberPermission PermissionLevel { get; set; }
}

public class UpdateLeadMemberPermissionCommandValidator : AbstractValidator<UpdateLeadMemberPermissionCommand>
{
    public UpdateLeadMemberPermissionCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.LeadId)
            .NotEmpty().WithMessage("Lead ID is required.");

        RuleFor(v => v.MemberId)
            .NotEmpty().WithMessage("Member ID is required.");

        RuleFor(v => v.PermissionLevel)
            .NotEqual(LeadMemberPermission.None).WithMessage("At least one permission must be granted.");

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

public class UpdateLeadMemberPermissionCommandHandler : IRequestHandler<UpdateLeadMemberPermissionCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public UpdateLeadMemberPermissionCommandHandler(
        ITenantDbContext context,
        INotificationService notificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor)
    {
        _context = context;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<bool>> Handle(UpdateLeadMemberPermissionCommand request, CancellationToken cancellationToken)
    {
        var leadMember = await _context.GetSet<LeadMember>()
            .Include(lm => lm.Lead)
            .FirstOrDefaultAsync(lm => lm.LeadId == request.LeadId 
                                       && lm.MemberId == request.MemberId 
                                       && !lm.IsDeleted, 
                cancellationToken);

        if (leadMember == null)
            return Result<bool>.Failure("Lead_006", "Lead member not found.");

        leadMember.PermissionLevel = request.PermissionLevel;
        await _context.SaveChangesAsync(cancellationToken);

        // Send notification to the affected member
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        
        await _notificationService.SendNotificationWithUserLanguages(
            _context,
            MessageType.LeadMemberPermissionUpdated,
            tenantInfo?.Id,
            new List<Guid> { request.MemberId },
            new
            {
                LeadName = leadMember.Lead.Name,
                LeadId = leadMember.Lead.Id.ToString(),
                LeadCode = leadMember.Lead.Code ?? string.Empty,
                NewPermissions = request.PermissionLevel.ToString()
            },
            cancellationToken);

        return Result<bool>.Success(true);
    }
}
