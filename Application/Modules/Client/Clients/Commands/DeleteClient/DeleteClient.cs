using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.Clients.Commands.DeleteClient;

public record DeleteClientCommand : IRequest<Result<DeleteClientResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteClientResponse
{
}

public class DeleteClientCommandValidator : AbstractValidator<DeleteClientCommand>
{
    public DeleteClientCommandValidator()
    {
    }
}

public class DeleteClientCommandHandler : IRequestHandler<DeleteClientCommand, Result<DeleteClientResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public DeleteClientCommandHandler(
        ITenantDbContext context,
        IMapper mapper
        )
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DeleteClientResponse>> Handle(DeleteClientCommand request,
        CancellationToken cancellationToken)
    {
        var client = await _context.GetSet<Novologs.Domain.Entities.Client>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (client == null)
        {
            return Result<DeleteClientResponse>.Failure("Client_002", "Client not found");
        }

        _context.GetSet<Novologs.Domain.Entities.Client>().Remove(client);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteClientResponse>.Success(new DeleteClientResponse());
    }
}
