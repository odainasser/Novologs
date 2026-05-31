using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Vendor.Contacts.Commands.DeleteContact;

public record DeleteContactCommand : IRequest<Result<DeleteContactResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteContactResponse
{
}

public class DeleteContactCommandValidator : AbstractValidator<DeleteContactCommand>
{
    public DeleteContactCommandValidator(ITenantDbContext context, IUser user)
    {

        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Contact ID is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Contact>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Contact not found.");
    }
}

public class DeleteContactCommandHandler : IRequestHandler<DeleteContactCommand, Result<DeleteContactResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public DeleteContactCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DeleteContactResponse>> Handle(DeleteContactCommand request,
        CancellationToken cancellationToken)
    {
        var contact = await _context.GetSet<Novologs.Domain.Entities.Contact>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (contact == null)
        {
            return Result<DeleteContactResponse>.Failure("Contact_002", "Contact not found");
        }

        _context.GetSet<Novologs.Domain.Entities.Contact>().Remove(contact);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteContactResponse>.Success(new DeleteContactResponse());
    }
}
