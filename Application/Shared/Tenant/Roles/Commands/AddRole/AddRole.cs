using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.AddRole;

public record AddRoleCommand : IRequest<Result<AddRoleResponse>>
{
    public string Name { get; set; } = null!;
}

public class AddRoleResponse
{
    public Guid Id { get; set; }
}

public class AddRoleCommandValidator : AbstractValidator<AddRoleCommand>
{
    public AddRoleCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithErrorCode("Role.Name.Empty").WithMessage("Role name is required.")
            .MaximumLength(200).WithErrorCode("Role.Name.TooLong")
            .WithMessage("Role name must not exceed 200 characters.")
            .MustAsync(async (name, cancellationToken) =>
                !await context.GetSet<IdentityRole<Guid>>().AnyAsync(r => r.Name == name, cancellationToken))
            .WithErrorCode("Role.Name.Duplicate").WithMessage("The specified role name already exists.");
    }
}

public class AddRoleCommandHandler : IRequestHandler<AddRoleCommand, Result<AddRoleResponse>>
{
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public AddRoleCommandHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper,
        RoleManager<IdentityRole<Guid>> roleManager,
        UserManager<TenantUser> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<AddRoleResponse>> Handle(AddRoleCommand request, CancellationToken cancellationToken)
    {
        var role = new IdentityRole<Guid>(request.Name);
        var result = await _roleManager.CreateAsync(role);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => new ErrorItem(e.Code, e.Description));
            return Result<AddRoleResponse>.Failure(errors);
        }

        return Result<AddRoleResponse>.Success(new AddRoleResponse() { Id = role.Id });
    }
}
