using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Client.Sources.Commands.UpdateSource;

public record UpdateSourceCommand : IRequest<Result<UpdateSourceResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateSourceCommand, Novologs.Domain.Entities.LeadSource>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdateSourceResponse
{
}

public class UpdateSourceCommandValidator : AbstractValidator<UpdateSourceCommand>
{
    public UpdateSourceCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name!.Value)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");
        RuleFor(v => v.Name)
            .MustAsync(async (name, cancellationToken) =>
            {
                if (name == null) return true;
                return !await context.GetSet<Novologs.Domain.Entities.LeadSource>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class UpdateSourceCommandHandler : IRequestHandler<UpdateSourceCommand, Result<UpdateSourceResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateSourceCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateSourceResponse>> Handle(UpdateSourceCommand request,
        CancellationToken cancellationToken)
    {
        var leadSource = await _context.GetSet<Novologs.Domain.Entities.LeadSource>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (leadSource == null)
        {
            return Result<UpdateSourceResponse>.Failure("Source_001", "Source not found.");
        }

        _mapper.Map(request, leadSource);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateSourceResponse>.Success(new UpdateSourceResponse());
    }
}
