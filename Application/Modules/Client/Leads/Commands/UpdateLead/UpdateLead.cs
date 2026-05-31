using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.Leads.Commands.UpdateLead;

public record UpdateLeadCommand : IRequest<Result<UpdateLeadResponse>>
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public Guid? ClientId { get; set; }

    public string? Code { get; set; }
    public Guid? LeadSourceId { get; set; }
    public double? Value { get; set; }
    public Guid? CurrencyId { get; set; }
    public double? Probability { get; set; }
    public DateTime? ExpectedAwardedDate { get; set; }
    public Guid? SaleStatusId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateLeadCommand, Novologs.Domain.Entities.ClientLead>()
                .ForMember(dest => dest.ExpectedAwardedDate,
                    opt => opt.MapFrom(src =>
                        src.ExpectedAwardedDate.HasValue
                            ? src.ExpectedAwardedDate.Value.ToUniversalTime()
                            : (DateTime?)null));
        }
    }
}

public class UpdateLeadResponse
{
}

public class UpdateLeadCommandValidator : AbstractValidator<UpdateLeadCommand>
{
    public UpdateLeadCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Lead not found.");

        RuleFor(v => v.Name)
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");

        RuleFor(v => v.ClientId)
            .NotEmpty().WithMessage("Client is required.")
            .MustAsync(async (clientId, cancellationToken) =>
            {
                if (!clientId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(c => c.Id == clientId, cancellationToken);
            }).WithMessage("Client not found.");

        RuleFor(v => v.LeadSourceId)
            .MustAsync(async (leadSourceId, cancellationToken) =>
            {
                if (!leadSourceId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.LeadSource>()
                    .AnyAsync(ls => ls.Id == leadSourceId, cancellationToken);
            }).WithMessage("Lead Source not found.");

        RuleFor(v => v.Value)
            .GreaterThanOrEqualTo(0).WithMessage("Value must be greater than or equal to 0.");

        RuleFor(v => v.CurrencyId)
            .MustAsync(async (currencyId, cancellationToken) =>
            {
                if (!currencyId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.Currency>()
                    .AnyAsync(c => c.Id == currencyId, cancellationToken);
            }).WithMessage("Currency not found.");

        RuleFor(v => v.ExpectedAwardedDate)
            .GreaterThan(DateTime.Now).WithMessage("Expected Awarded Date must be in the future.");
        RuleFor(v => v.SaleStatusId)
            .MustAsync(async (saleStatusId, cancellationToken) =>
            {
                if (!saleStatusId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>()
                    .AnyAsync(ss => ss.Id == saleStatusId, cancellationToken);
            }).WithMessage("Sale Status not found.");

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.");
        RuleFor(v => v.Code)
            .MustAsync(async (command, code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(c => c.Code!.ToLower() == code.ToLower() && c.Id != command.Id, cancellationToken);
            }).WithMessage("Code already exists.");
    }
}

public class UpdateLeadCommandHandler : IRequestHandler<UpdateLeadCommand, Result<UpdateLeadResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateLeadCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateLeadResponse>> Handle(UpdateLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _context.GetSet<Novologs.Domain.Entities.ClientLead>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (lead == null)
        {
            return Result<UpdateLeadResponse>.Failure("Lead_003", "Lead not found");
        }

        _mapper.Map(request, lead);
        _context.GetSet<Novologs.Domain.Entities.ClientLead>().Update(lead);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateLeadResponse>.Success(new UpdateLeadResponse());
    }
}
