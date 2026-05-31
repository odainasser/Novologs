using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Vendor.ContractStatuses.Commands.AddContractStatus;

public record AddContractStatusCommand : IRequest<Result<AddContractStatusResponse>>
{
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddContractStatusCommand, Novologs.Domain.Entities.VendorContractStatus>();
        }
    }
}

public class AddContractStatusResponse
{
    public Guid Id { get; set; }
}

public class AddContractStatusCommandValidator : AbstractValidator<AddContractStatusCommand>
{
    public AddContractStatusCommandValidator(ITenantDbContext context, IUser user)
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
                return !await context.GetSet<Novologs.Domain.Entities.VendorContractStatus>()
                    .Include(vcs => vcs.Name)
                    .ThenInclude(lt => lt.LocalizedStrings)
                    .AnyAsync(vcs => vcs.Name.Value.ToLower() == name.Value.ToLower() ||
                                     vcs.Name.LocalizedStrings.Any(ls => ls.Value.ToLower() == name.Value.ToLower()),
                        cancellationToken);
            }).WithMessage("A contract status with this name already exists.");
    }
}

public class
    AddContractStatusCommandHandler : IRequestHandler<AddContractStatusCommand, Result<AddContractStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public AddContractStatusCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<AddContractStatusResponse>> Handle(AddContractStatusCommand request,
        CancellationToken cancellationToken)
    {
        var contractStatus = _mapper.Map<Novologs.Domain.Entities.VendorContractStatus>(request);
        _context.GetSet<Novologs.Domain.Entities.VendorContractStatus>().Add(contractStatus);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddContractStatusResponse>.Success(new AddContractStatusResponse() { Id = contractStatus.Id });
    }
}
