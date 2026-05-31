using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Commands.ChangeLeadStatus;

public class ChangeLeadStatusCommandValidator : AbstractValidator<ChangeLeadStatusCommand>
{
    public ChangeLeadStatusCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Lead not found.");

        When(v => v.LeadStatus == LeadStatus.Awarded, () =>
        {
            RuleFor(v => v.AwardedValue)
                .NotEmpty().WithMessage("Awarded Value is required when status is Awarded.")
                .GreaterThanOrEqualTo(0).WithMessage("Awarded Value must be greater than or equal to 0.");

            RuleFor(v => v.AwardedCurrencyId)
                .NotEmpty().WithMessage("Awarded Currency is required when status is Awarded.")
                .MustAsync(async (currencyId, cancellationToken) =>
                {
                    if (!currencyId.HasValue) return true;
                    return await context.GetSet<Novologs.Domain.Entities.Currency>()
                        .AnyAsync(c => c.Id == currencyId, cancellationToken);
                }).WithMessage("Awarded Currency not found.");

            RuleFor(v => v.AwardedDate)
                .NotEmpty().WithMessage("Awarded Date is required when status is Awarded.")
                .LessThanOrEqualTo(DateTime.Now).WithMessage("Awarded Date must be in the past or present.");
        });

        When(v => v.LeadStatus == LeadStatus.Rejected, () =>
        {
            RuleFor(v => v.RejectedDate)
                .NotEmpty().WithMessage("Rejected Date is required when status is Rejected.")
                .LessThanOrEqualTo(DateTime.Now).WithMessage("Rejected Date must be in the past or present.");

            RuleFor(v => v.RejectionReasonId)
                .NotEmpty().WithMessage("Rejection Reason is required when status is Rejected.")
                .MustAsync(async (rejectionReasonId, cancellationToken) =>
                {
                    if (!rejectionReasonId.HasValue) return true;
                    return await context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>()
                        .AnyAsync(rr => rr.Id == rejectionReasonId, cancellationToken);
                }).WithMessage("Rejection Reason not found.");
        });
        
        RuleFor(v => v.SaleStatusId)
            .MustAsync(async (saleStatusId, cancellationToken) =>
            {
                if (!saleStatusId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>()
                    .AnyAsync(ss => ss.Id == saleStatusId, cancellationToken);
            }).WithMessage("Sale Status not found.");
        
    }
}
