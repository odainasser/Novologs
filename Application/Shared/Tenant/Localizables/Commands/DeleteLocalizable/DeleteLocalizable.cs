using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Localizables.Commands.DeleteLocalizable;

public record DeleteLocalizableCommand : IRequest<Result<DeleteLocalizableResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteLocalizableResponse
{
}

public class DeleteLocalizableCommandValidator : AbstractValidator<DeleteLocalizableCommand>
{
    public DeleteLocalizableCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty().WithMessage("Id is required.");
    }
}

public class
    DeleteLocalizableCommandHandler : IRequestHandler<DeleteLocalizableCommand, Result<DeleteLocalizableResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public DeleteLocalizableCommandHandler(
        ITenantDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper; 
    }

    public async Task<Result<DeleteLocalizableResponse>> Handle(DeleteLocalizableCommand request,
        CancellationToken cancellationToken)
    {
        var localizable = await _context.GetSet<Domain.Entities.LocalizableText>()
            .FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken);
        if (localizable == null)
        {
            return Result<DeleteLocalizableResponse>.Failure("Localizable_001", "Localizable not found.");
        }

        _context.GetSet<Domain.Entities.LocalizableText>().Remove(localizable);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteLocalizableResponse>.Success(new DeleteLocalizableResponse());
    }
}
