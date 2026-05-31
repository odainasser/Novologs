

using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Localizables.DTOs;
using Novologs.Application.Modules.Vendor.ContractStatuses.Commands.AddContractStatus;

namespace Novologs.Application.Modules.Vendor.ContractTypes.Commands.AddContractType;

public record AddContractTypeCommand : IRequest<Result<AddContractTypeResponse>>
{
   
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddContractTypeCommand, Novologs.Domain.Entities.VendorContractType>();
        }
    }
}

public class AddContractTypeResponse
{
    public Guid Id { get; set; }
}

public class AddContractTypeCommandValidator : AbstractValidator<AddContractTypeCommand>
{
    public AddContractTypeCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name.Value)
            .NotEmpty().WithMessage("Name value is required.")
            .MaximumLength(2048).WithMessage("Name value must not exceed 2048 characters.");

        RuleFor(v => v.Name.LocalizedStrings)
            .Must(list => list.All(l => !string.IsNullOrEmpty(l.Language) && !string.IsNullOrEmpty(l.Value)))
            .WithMessage("All localized strings must have a language and a value.");

        RuleFor(v => v.Name)
            .MustAsync(async (name, cancellationToken) =>
            {
                return !await context.GetSet<Novologs.Domain.Entities.VendorContractType>()
                    .Include(vct => vct.Name)
                    .ThenInclude(lt => lt.LocalizedStrings)
                    .AnyAsync(vct => vct.Name.Value.ToLower() == name.Value.ToLower() ||
                                     vct.Name.LocalizedStrings.Any(ls => ls.Value.ToLower() == name.Value.ToLower()),
                        cancellationToken);
            }).WithMessage("A contract type with this name already exists.");
    }
}

public class AddContractTypeCommandHandler : IRequestHandler<AddContractTypeCommand, Result<AddContractTypeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public AddContractTypeCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<AddContractTypeResponse>> Handle(AddContractTypeCommand request, CancellationToken cancellationToken)
    {
        var contractType = _mapper.Map<Novologs.Domain.Entities.VendorContractType>(request);
        _context.GetSet<Novologs.Domain.Entities.VendorContractType>().Add(contractType);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddContractTypeResponse>.Success(new AddContractTypeResponse() { Id = contractType.Id });
    }
}
