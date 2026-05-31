using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.DeleteUser;

public record DeleteUserCommand : IRequest<Result<DeleteUserResponse>>
{
    public Guid UserId { get; set; }
}

public class DeleteUserCommandValidator : AbstractValidator<DeleteUserCommand>
{
    public DeleteUserCommandValidator()
    {
    }
}

public class DeleteUserResponse
{
}

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result<DeleteUserResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly UserManager<TenantUser> _userManager;

    public DeleteUserCommandHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IHttpContextAccessor httpContextAccessor
    )
    {
        _context = context;
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<DeleteUserResponse>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            return Result<DeleteUserResponse>.Failure(new[] { new ErrorItem("User_002", "User not found") });
        }

        user.IsDeleted = true;
        user.DeletedOnDate = DateTime.UtcNow;
        user.DeletedBy = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        // Rename username/email so the unique DB constraints are freed immediately,
        // allowing the same email/username to be reused when creating a new user.
        var suffix = $"_deleted_{user.Id}";
        user.UserName = $"{user.UserName}{suffix}";
        user.NormalizedUserName = user.UserName.ToUpperInvariant();
        user.Email = $"{user.Email}{suffix}";
        user.NormalizedEmail = user.Email!.ToUpperInvariant();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Result<DeleteUserResponse>.Failure(result.Errors.Select(e => new ErrorItem(e.Code, e.Description)));
        }

        //Remove user to general department from the hierarchy
        //Process the hierarch for user
        //remove from hierarchy if no childe or clear if it hase children
        //if has no children clear parents chain
        var allHirarchy = await _context.GetSet<OrganizationStructure>()
            .Include(h => h.Children)
            .ToListAsync(cancellationToken);
        var nodeToDelete = allHirarchy.FirstOrDefault(d => d.EmployeeId == request.UserId);
        if (nodeToDelete == null)
        {
            return Result<DeleteUserResponse>.Success(new DeleteUserResponse());
        }

        var generalDepartment = await _context.GetSet<Domain.Entities.Department>()
            .FirstOrDefaultAsync(d => d.Name.Value == "General", cancellationToken);

        var generalDepartmentNode = allHirarchy.FirstOrDefault(d => d.DepartmentId == generalDepartment!.Id);

        if (generalDepartmentNode == null)
        {
            return Result<DeleteUserResponse>.Failure(new[]
            {
                new ErrorItem("Hierarchy_003", "General department node not found")
            });
        }

        var newNode = new OrganizationStructure(Guid.NewGuid())
        {
            ParentStructureId = generalDepartmentNode!.Id, EmployeeId = nodeToDelete!.EmployeeId
        };
        await _context.GetSet<OrganizationStructure>().AddAsync(newNode, cancellationToken);
        nodeToDelete.EmployeeId = null;

        HierarchUtil.ClearHierarchyParent(nodeToDelete);

        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteUserResponse>.Success(new DeleteUserResponse());
    }
}
