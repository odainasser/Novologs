using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.AddDescriptionToPermission;

public record AddDescriptionToPermissionCommand : IRequest<Result<AddDescriptionToPermissionResponse>>
{
    public Guid Id { get; set; }
    public string Description { get; set; } = null!;
}

public class AddDescriptionToPermissionResponse
{
}

public class AddDescriptionToPermissionCommandValidator : AbstractValidator<AddDescriptionToPermissionCommand>
{
    public AddDescriptionToPermissionCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithErrorCode("Permission.Id.Empty").WithMessage("Permission id is required.")
            .MustAsync(async (id, cancellationToken) =>
                await context.GetSet<Permission>().AnyAsync(p => p.Id == id, cancellationToken))
            .WithErrorCode("Permission.NotFound").WithMessage("The specified permission not exists.");

        RuleFor(v => v.Description)
            .MaximumLength(2500).WithErrorCode("Permission.Description.TooLong")
            .WithMessage("Permission description must not exceed 2500 characters.");
    }
}

public class AddDescriptionToPermissionCommandHandler : IRequestHandler<AddDescriptionToPermissionCommand,
    Result<AddDescriptionToPermissionResponse>>
{
    private readonly ITenantDbContext _context;

    public AddDescriptionToPermissionCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AddDescriptionToPermissionResponse>> Handle(AddDescriptionToPermissionCommand request,
        CancellationToken cancellationToken)
    {
        var permission = await _context.GetSet<Permission>()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (permission == null)
        {
            return Result<AddDescriptionToPermissionResponse>.Failure(new List<ErrorItem>()
            {
                new ErrorItem("Permission.NotFound", "The specified permission not exists.")
            });
        }

        permission.Description = request.Description;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddDescriptionToPermissionResponse>.Success(new AddDescriptionToPermissionResponse());
    }
}
