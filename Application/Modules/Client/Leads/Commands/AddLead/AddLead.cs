using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Tenant;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Commands.AddLead;

public record AddLeadCommand : IRequest<Result<AddLeadResponse>>
{
    public string Name { get; set; } = null!;
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
            CreateMap<AddLeadCommand, Novologs.Domain.Entities.ClientLead>()
                .ForMember(dest => dest.ExpectedAwardedDate,
                    opt => opt.MapFrom(src =>
                        src.ExpectedAwardedDate.HasValue
                            ? src.ExpectedAwardedDate.Value.ToUniversalTime()
                            : (DateTime?)null));
            ;
        }
    }
}

public class AddLeadResponse
{
    public Guid Id { get; set; }
}

public class AddLeadCommandValidator : AbstractValidator<AddLeadCommand>
{
    public AddLeadCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");

        RuleFor(v => v.ClientId)
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
            .MustAsync(async (code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(c => c.Code!.ToLower() == code.ToLower(), cancellationToken);
            }).WithMessage("Code already exists.");
    }
}

public class AddLeadCommandHandler : IRequestHandler<AddLeadCommand, Result<AddLeadResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddLeadCommandHandler(ITenantDbContext context, IMapper mapper,
        IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddLeadResponse>> Handle(AddLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = _mapper.Map<Novologs.Domain.Entities.ClientLead>(request);
        lead.CreatorId = Guid.Parse(_user.Id!);
        _context.GetSet<Novologs.Domain.Entities.ClientLead>().Add(lead);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Only create folder if lead is associated with a client
        if (request.ClientId.HasValue)
        {
            var clientFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .FirstOrDefaultAsync(f => f.Type == FolderType.Shared && f.ClientId == request.ClientId, cancellationToken);
            if (clientFolder != null)
            {
                var leadFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
                {
                    Name = lead.Name,
                    Type = Novologs.Domain.Enums.FolderType.Shared,
                    ParentFolderId = clientFolder.Id,
                    IsFile = false,
                    CreatorId = lead.CreatorId,
                    LeadId = lead.Id
                };
                await _context.GetSet<Novologs.Domain.Entities.Folder>().AddAsync(leadFolder, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }


        return Result<AddLeadResponse>.Success(new AddLeadResponse() { Id = lead.Id });
    }
}
