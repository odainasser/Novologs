using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Tenant;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Vendor.Contracts.Commands.AddContract;

public record AddContractCommand : IRequest<Result<AddContractResponse>>
{
    public string Name { get; set; } = null!;
    public Guid VendorId { get; set; }
    public string? Code { get; set; }

    public string? Description { get; set; }

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
            CreateMap<AddContractCommand, Novologs.Domain.Entities.VendorContract>()
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

public class AddContractResponse
{
    public Guid Id { get; set; }
}

public class AddContractCommandValidator : AbstractValidator<AddContractCommand>
{
    public AddContractCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");

        RuleFor(v => v.VendorId)
            .NotEmpty().WithMessage("Vendor is required.")
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
            .MustAsync(async (code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .AnyAsync(c => c.Code!.ToLower() == code.ToLower(), cancellationToken);
            }).WithMessage("Code already exists.");
    }
}

public class AddContractCommandHandler : IRequestHandler<AddContractCommand, Result<AddContractResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;


    public AddContractCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddContractResponse>> Handle(AddContractCommand request,
        CancellationToken cancellationToken)
    {
        var contract = _mapper.Map<Novologs.Domain.Entities.VendorContract>(request);
        contract.CreatorId = Guid.Parse(_user.Id!);
        _context.GetSet<Novologs.Domain.Entities.VendorContract>().Add(contract);
        await _context.SaveChangesAsync(cancellationToken);

        var vendorFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f => f.Type == FolderType.Shared && f.VendorId == request.VendorId, cancellationToken);
        if (vendorFolder != null)
        {
            var contractFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
            {
                Name = contract.Name,
                Type = Novologs.Domain.Enums.FolderType.Shared,
                ParentFolderId = vendorFolder.Id,
                IsFile = false,
                CreatorId = contract.CreatorId,
                ContractId = contract.Id
            };
            await _context.GetSet<Novologs.Domain.Entities.Folder>().AddAsync(contractFolder, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result<AddContractResponse>.Success(new AddContractResponse() { Id = contract.Id });
    }
}
