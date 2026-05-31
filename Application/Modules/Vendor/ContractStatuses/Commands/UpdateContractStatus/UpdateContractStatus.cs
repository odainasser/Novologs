

using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Vendor.ContractStatuses.Commands.UpdateContractStatus;

public record UpdateContractStatusCommand : IRequest<Result<UpdateContractStatusResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateContractStatusCommand, Novologs.Domain.Entities.VendorContractStatus>();
        }
    }
}

public class UpdateContractStatusResponse
{
}

public class UpdateContractStatusCommandValidator : AbstractValidator<UpdateContractStatusCommand>
{
    public UpdateContractStatusCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.VendorContractStatus>()
                    .AnyAsync(vcs => vcs.Id == id, cancellationToken);
            }).WithMessage("Contract Status not found.");

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
                return !await context.GetSet<Novologs.Domain.Entities.VendorContractStatus>()
                    .Include(vcs => vcs.Name)
                    .ThenInclude(lt => lt.LocalizedStrings)
                    .AnyAsync(vcs => (vcs.Name.Value.ToLower() == name.Value.ToLower() ||
                                     vcs.Name.LocalizedStrings.Any(ls => ls.Value.ToLower() == name.Value.ToLower())) &&
                                     vcs.Id != command.Id,
                        cancellationToken);
            }).WithMessage("A contract status with this name already exists.");
    }
}

public class UpdateContractStatusCommandHandler : IRequestHandler<UpdateContractStatusCommand, Result<UpdateContractStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public UpdateContractStatusCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<UpdateContractStatusResponse>> Handle(UpdateContractStatusCommand request, CancellationToken cancellationToken)
    {
        var contractStatus = await _context.GetSet<Novologs.Domain.Entities.VendorContractStatus>() 
            .FirstOrDefaultAsync(vcs => vcs.Id == request.Id, cancellationToken);

        if (contractStatus == null)
        {
            return Result<UpdateContractStatusResponse>.Failure("ContractStatus_002", "Contract Status not found.");
        }

        _mapper.Map(request, contractStatus);
        _context.GetSet<Novologs.Domain.Entities.VendorContractStatus>().Update(contractStatus);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateContractStatusResponse>.Success(new UpdateContractStatusResponse());
    }
}
