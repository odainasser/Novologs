using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Designations.Commands.DeleteDesignation;

public record DeleteDesignationCommand : IRequest<Result<DeleteDesignationResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteDesignationResponse
{
}

public class DeleteDesignationCommandValidator : AbstractValidator<DeleteDesignationCommand>
{
    public DeleteDesignationCommandValidator(ITenantDbContext context)
    {
    
        RuleFor(v => v.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id).MustAsync(async (id, cancellationToken) =>
        {
            return !await context.GetSet<Domain.Entities.Designation>()
                .Include(d => d.Employees)
                .AnyAsync(d => d.Id == id && d.Employees.Any(), cancellationToken);
        }).WithMessage("Cannot delete a designation with employees.");
    }
}

public class
    DeleteDesignationCommandHandler : IRequestHandler<DeleteDesignationCommand, Result<DeleteDesignationResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public DeleteDesignationCommandHandler(ITenantDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DeleteDesignationResponse>> Handle(DeleteDesignationCommand request,
        CancellationToken cancellationToken)
    {
        var designation = await _context.GetSet<Domain.Entities.Designation>()
            .FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken);
        if (designation == null)
        {
            return Result<DeleteDesignationResponse>.Failure("Designation_001", "Designation not found.");
        }

        _context.GetSet<Domain.Entities.Designation>().Remove(designation);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteDesignationResponse>.Success(new DeleteDesignationResponse());
    }
}
