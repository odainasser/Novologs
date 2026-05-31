using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.User.Commands.ActivateDeactivateUser;

public record ActivateDeactivateUserCommand : IRequest<Result<ActivateDeactivateUserResponse>>
{
    public Guid UserId { get; set; }
    public bool IsActive { get; set; }
}

public class ActivateDeactivateUserResponse
{
}

public class ActivateDeactivateUserCommandValidator : AbstractValidator<ActivateDeactivateUserCommand>
{
    public ActivateDeactivateUserCommandValidator(
        ITenantDbContext context
    )
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.")
            .MustAsync(async (userId, cancellationToken) =>
            {
                var userExists = await context.GetSet<Domain.Entities.TenantUser>()
                    .AnyAsync(u => u.Id == userId, cancellationToken);
                return userExists;
            }).WithMessage("User not found.");
    }
}

public class
    ActivateDeactivateUserCommandHandler : IRequestHandler<ActivateDeactivateUserCommand,
    Result<ActivateDeactivateUserResponse>>
{
    private readonly ITenantDbContext _context;

    public ActivateDeactivateUserCommandHandler(
        ITenantDbContext context
    )
    {
        _context = context;
    }

    public async Task<Result<ActivateDeactivateUserResponse>> Handle(ActivateDeactivateUserCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _context.GetSet<Domain.Entities.TenantUser>()
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return Result<ActivateDeactivateUserResponse>.Failure("User_003", "User not found.");
        }

        if (!request.IsActive)
        {
            // The "General" department node is the holding area — users moved there via
            // DeleteUserFromHierarchy are considered already removed from the org chart.
            var generalDepartment = await _context.GetSet<Domain.Entities.Department>()
                .FirstOrDefaultAsync(d => d.Name.Value == "General", cancellationToken);

            var generalDeptNodeId = generalDepartment != null
                ? await _context.GetSet<Domain.Entities.OrganizationStructure>()
                    .Where(o => o.DepartmentId == generalDepartment.Id && !o.IsDeleted)
                    .Select(o => (Guid?)o.Id)
                    .FirstOrDefaultAsync(cancellationToken)
                : null;

            var isInOrgChart = await _context.GetSet<Domain.Entities.OrganizationStructure>()
                .AnyAsync(o => o.EmployeeId == request.UserId
                               && !o.IsDeleted
                               && o.ParentStructureId != generalDeptNodeId, cancellationToken);

            if (isInOrgChart)
            {
                return Result<ActivateDeactivateUserResponse>.Failure(
                    "User_004",
                    "User is assigned in the organization chart. Please remove them from the org chart before deactivating.");
            }
        }

        user.IsActive = request.IsActive;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<ActivateDeactivateUserResponse>.Success(new ActivateDeactivateUserResponse());
    }
}
