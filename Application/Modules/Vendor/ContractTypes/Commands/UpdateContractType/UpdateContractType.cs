using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Vendor.ContractTypes.Commands.UpdateContractType;

public record UpdateContractTypeCommand : IRequest<Result<UpdateContractTypeResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateContractTypeCommand, Novologs.Domain.Entities.VendorContractType>();
        }
    }
}

public class UpdateContractTypeResponse
{
}

public class UpdateContractTypeCommandValidator : AbstractValidator<UpdateContractTypeCommand>
{
    public UpdateContractTypeCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.VendorContractType>()
                    .AnyAsync(vct => vct.Id == id, cancellationToken);
            }).WithMessage("Contract Type not found.");

        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name.Value)
            .NotEmpty().WithMessage("Name value is required.")
            .MaximumLength(2048).WithMessage("Name value must not exceed 2048 characters.");

        RuleFor(v => v.Name.LocalizedStrings)
            .Must(list => list.All(l => !string.IsNullOrEmpty(l.Language) && !string.IsNullOrEmpty(l.Value)))
            .WithMessage("All localized strings must have a language and a value.");

        RuleFor(v => v.Name)
            .MustAsync(async (command, name, cancellationToken) =>
            {
                return !await context.GetSet<Novologs.Domain.Entities.VendorContractType>()
                    .Include(vct => vct.Name)
                    .ThenInclude(lt => lt.LocalizedStrings)
                    .AnyAsync(vct => (vct.Name.Value.ToLower() == name.Value.ToLower() ||
                                     vct.Name.LocalizedStrings.Any(ls => ls.Value.ToLower() == name.Value.ToLower())) &&
                                     vct.Id != command.Id,
                        cancellationToken);
            }).WithMessage("A contract type with this name already exists.");
    }
}

public class UpdateContractTypeCommandHandler : IRequestHandler<UpdateContractTypeCommand, Result<UpdateContractTypeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public UpdateContractTypeCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<UpdateContractTypeResponse>> Handle(UpdateContractTypeCommand request, CancellationToken cancellationToken)
    {
        var contractType = await _context.GetSet<Novologs.Domain.Entities.VendorContractType>()
            .FirstOrDefaultAsync(vct => vct.Id == request.Id, cancellationToken);

        if (contractType == null)
        {
            return Result<UpdateContractTypeResponse>.Failure("ContractType_002", "Contract Type not found.");
        }

        _mapper.Map(request, contractType);
        _context.GetSet<Novologs.Domain.Entities.VendorContractType>().Update(contractType);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateContractTypeResponse>.Success(new UpdateContractTypeResponse());
    
    }
}
