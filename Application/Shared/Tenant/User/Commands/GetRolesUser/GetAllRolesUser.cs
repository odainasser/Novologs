using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.GetRolesUser;

public record GetAllRolesUserCommand : IRequest<Result<GetAllRolesUserResponse>>
{
}

public class GetAllRolesUserCommandValidator : AbstractValidator<GetAllRolesUserCommand>
{
    public GetAllRolesUserCommandValidator()
    {
    }
}

public class GetAllRolesUserResponse
{
    public List<string?> Roles { get; set; } = new List<string?>();
    public List<string> Permissions { get; set; } = new List<string>();
}

public class GetAllRolesUserCommandHandler : IRequestHandler<GetAllRolesUserCommand, Result<GetAllRolesUserResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public GetAllRolesUserCommandHandler(
        ITenantDbContext context,
        RoleManager<IdentityRole<Guid>> roleManager
    )
    {
        _context = context;
        _roleManager = roleManager;
    }

    public async Task<Result<GetAllRolesUserResponse>> Handle(GetAllRolesUserCommand request,
        CancellationToken cancellationToken)
    {  
        var roles = await _roleManager.Roles
            .Select(r => r.Name)
            .ToListAsync(cancellationToken);  
        var permissions = await _context.GetSet<Permission>().Select(p => p.Name).ToListAsync(cancellationToken);

        
        
        var response = new GetAllRolesUserResponse { Roles = roles, Permissions = permissions };
        return Result<GetAllRolesUserResponse>.Success(response);
    }
}
