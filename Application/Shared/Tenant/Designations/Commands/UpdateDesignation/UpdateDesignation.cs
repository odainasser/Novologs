using Newtonsoft.Json;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Designations.Commands.UpdateDesignation;

public record UpdateDesignationCommand : IRequest<Result<UpdateDesignationResponse>>
{
    public Guid Id { get; set; }
    public required LocalizableTextDto Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateDesignationCommand, Domain.Entities.Designation>()
                .ForMember(dest => dest.Name, opt => opt.Ignore());
        }
    }
}

public class UpdateDesignationResponse
{
}

public class UpdateDesignationCommandValidator : AbstractValidator<UpdateDesignationCommand>
{
    public UpdateDesignationCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Name).NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name.Value).NotEmpty().WithMessage("Name is required."); 
        RuleFor(v => v.Name.Value)
            .MustAsync(async (command, name, cancellationToken) =>
            {
                return !await context.GetSet<Domain.Entities.Designation>()
                    .AnyAsync(d => d.Id != command.Id && d.Name.Value.ToLower().Trim() == name.ToLower().Trim(),
                        cancellationToken);
            }).WithMessage("The specified name already exists.");
    }
}

public class
    UpdateDesignationCommandHandler : IRequestHandler<UpdateDesignationCommand, Result<UpdateDesignationResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateDesignationCommandHandler(
        ITenantDbContext context,
        IMapper mapper
    )
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateDesignationResponse>> Handle(UpdateDesignationCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var designation = await _context.GetSet<Designation>()
                .Include(d => d.Name.LocalizedStrings)
                .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken: cancellationToken);
            if (designation == null)
            {
                return Result<UpdateDesignationResponse>.Failure("Designation_001", "Designation not found.");
            }

            var currentLocalizedStrings = designation.Name.LocalizedStrings;
            var incomingLocalizedStrings = request.Name.LocalizedStrings;

            _mapper.Map(request, designation);
            designation.Name.Value = request.Name.Value;

            foreach (var current in currentLocalizedStrings.ToList())
            {
                if (incomingLocalizedStrings.All(inc => inc.Id != current.Id))
                {
                    _context.GetSet<LocalizedString>().Remove(current);
                }
            }

            foreach (var incoming in incomingLocalizedStrings)
            {
                var existing = currentLocalizedStrings.FirstOrDefault(current => current.Id == incoming.Id);
                if (existing != null)
                {
                    _mapper.Map(incoming, existing);
                }
                else
                {
                    var newLocalizedString = _mapper.Map<LocalizedString>(incoming);
                    newLocalizedString.LocalizableId = designation.NameId;
                    _context.GetSet<LocalizedString>().Add(newLocalizedString);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return Result<UpdateDesignationResponse>.Success(new UpdateDesignationResponse());
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}
