using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Vendor.Contracts.Commands.UpdateContract;

public record UpdateContractCommand : IRequest<Result<UpdateContractResponse>>
{
    public Guid Id { get; set; }
    public string? Name { get; set; } = null!;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public Guid? VendorId { get; set; }

    public Guid? VendorContractTypeId { get; set; }
    public Guid? VendorContractStatusId { get; set; }
    public double? Value { get; set; }
    public Guid? CurrencyId { get; set; }
    public DateTime? ExpectedStartDate { get; set; }
    public DateTime? ExpectedEndDate { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateContractCommand, Novologs.Domain.Entities.VendorContract>()
                .ForMember(dest => dest.ExpectedStartDate,
                    opt => opt.MapFrom(src =>
                        src.ExpectedStartDate.HasValue
                            ? src.ExpectedStartDate.Value.ToUniversalTime()
                            : (DateTime?)null))
                .ForMember(dest => dest.ExpectedEndDate,
                    opt => opt.MapFrom(src =>
                        src.ExpectedEndDate.HasValue ? src.ExpectedEndDate.Value.ToUniversalTime() : (DateTime?)null))
                ;
        }
    }
}

public class UpdateContractResponse
{
}

public class UpdateContractCommandValidator : AbstractValidator<UpdateContractCommand>
{
    public UpdateContractCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Contract not found.");

        RuleFor(v => v.Name)
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");

        RuleFor(v => v.VendorId)
            .MustAsync(async (vendorId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(c => c.Id == vendorId, cancellationToken);
            }).WithMessage("Vendor not found.");

        RuleFor(v => v.VendorContractTypeId)
            .MustAsync(async (vendorContractTypeId, cancellationToken) =>
            {
                if (!vendorContractTypeId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.VendorContractType>()
                    .AnyAsync(vct => vct.Id == vendorContractTypeId, cancellationToken);
            }).WithMessage("Vendor Contract Type not found.");

        RuleFor(v => v.VendorContractStatusId)
            .MustAsync(async (vendorContractStatusId, cancellationToken) =>
            {
                if (!vendorContractStatusId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.VendorContractStatus>()
                    .AnyAsync(vcs => vcs.Id == vendorContractStatusId, cancellationToken);
            }).WithMessage("Vendor Contract Status not found.");


        RuleFor(v => v.Value)
            .GreaterThanOrEqualTo(0).WithMessage("Value must be greater than or equal to 0.");

        RuleFor(v => v.CurrencyId)
            .MustAsync(async (currencyId, cancellationToken) =>
            {
                if (!currencyId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.Currency>()
                    .AnyAsync(c => c.Id == currencyId, cancellationToken);
            }).WithMessage("Currency not found.");

        RuleFor(v => v.ExpectedEndDate)
            .GreaterThan(v => v.ExpectedStartDate)
            .WithMessage("Expected End Date must be greater than Expected Start Date.");

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.");
        RuleFor(v => v.Code)
            .MustAsync(async (command, code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .AnyAsync(c => c.Code!.ToLower() == code.ToLower() && c.Id != command.Id, cancellationToken);
            }).WithMessage("Code already exists.");
    }
}

public class UpdateContractCommandHandler : IRequestHandler<UpdateContractCommand, Result<UpdateContractResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;


    public UpdateContractCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateContractResponse>> Handle(UpdateContractCommand request,
        CancellationToken cancellationToken)
    {
        var contract = _context.GetSet<Novologs.Domain.Entities.VendorContract>()
            .FirstOrDefault(c => c.Id == request.Id);
        if (contract == null)
        {
            return Result<UpdateContractResponse>.Failure("Contract_003", "Contract not found");
        }

        _mapper.Map(request, contract);
        _context.GetSet<Novologs.Domain.Entities.VendorContract>().Update(contract);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateContractResponse>.Success(new UpdateContractResponse());
    }
}
