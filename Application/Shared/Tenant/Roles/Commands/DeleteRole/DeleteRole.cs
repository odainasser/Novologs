using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.DeleteRole;

public record DeleteRoleCommand : IRequest<Result<DeleteRoleResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteRoleResponse
{
}

public class DeleteRoleCommandValidator : AbstractValidator<DeleteRoleCommand>
{
    public DeleteRoleCommandValidator(
        ITenantDbContext context,
        IUser user,
        RoleManager<IdentityRole<Guid>> roleManager,
        UserManager<TenantUser> userManager)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithErrorCode("Role.Id.Empty").WithMessage("Role id is required.")
            .MustAsync(async (id, cancellationToken) =>
                await context.GetSet<IdentityRole<Guid>>().AnyAsync(r => r.Id == id, cancellationToken))
            .WithErrorCode("Role.NotFound").WithMessage("The specified role not exists.")
            .MustAsync(async (id, cancellationToken) =>
            {
                var role = await context.GetSet<IdentityRole<Guid>>().FindAsync(new object[] { id }, cancellationToken);
                if (role == null) return false;

                var usersInRole = await userManager.GetUsersInRoleAsync(role.Name!);
                return !usersInRole.Any();
            }).WithErrorCode("Role.HasUsers").WithMessage("Cannot delete role as there are users assigned to it.");
        //if role is in default roles it can't be deleted
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                var role = await context.GetSet<IdentityRole<Guid>>().FindAsync(new object[] { id }, cancellationToken);
                if (role == null) return false;

                var defaultRoles = typeof(Domain.Constants.Roles)
                    .GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
                    .Where(fi => fi.IsLiteral && !fi.IsInitOnly)
                    .Select(fi => fi.GetRawConstantValue() as string)
                    .ToList();

                return !defaultRoles.Contains(role.Name);
            }).WithErrorCode("Role.IsDefault").WithMessage("Cannot delete a default system role.");
    }
}

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, Result<DeleteRoleResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public DeleteRoleCommandHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper,
        RoleManager<IdentityRole<Guid>> roleManager,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task<Result<DeleteRoleResponse>> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleManager.FindByIdAsync(request.Id.ToString());
        if (role == null)
        {
            return Result<DeleteRoleResponse>.Failure("Role.NotFound", "Role not found.");
        }

        var roleNames = typeof(Domain.Constants.Roles)
            .GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
            .Where(fi => fi.IsLiteral && !fi.IsInitOnly)
            .Select(fi => fi.GetRawConstantValue() as string)
            .ToList();

        if (roleNames.Contains(role.Name))
        {
            return Result<DeleteRoleResponse>.Failure("Role.CannotDelete", "Cannot delete this system role.");
        }


        var result = await _roleManager.DeleteAsync(role);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => new ErrorItem(e.Code, e.Description));
            return Result<DeleteRoleResponse>.Failure(errors);
        }

        return Result<DeleteRoleResponse>.Success(new DeleteRoleResponse());
    }
}
