using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.UserGroups.Commands.DeleteUserGroup;

public record DeleteUserGroupCommand : IRequest<Result<DeleteUserGroupResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteUserGroupResponse
{
}

public class DeleteUserGroupCommandValidator : AbstractValidator<DeleteUserGroupCommand>
{
    public DeleteUserGroupCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<UserGroup>().AnyAsync(ug => ug.Id == id, cancellationToken);
            })
            .WithMessage("User group not found.");
    }
}

public class DeleteUserGroupCommandHandler : IRequestHandler<DeleteUserGroupCommand, Result<DeleteUserGroupResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public DeleteUserGroupCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<DeleteUserGroupResponse>> Handle(DeleteUserGroupCommand request,
        CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<UserGroup>()
            .Include(g => g.Members)
            .FirstOrDefaultAsync(ug => ug.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<DeleteUserGroupResponse>.Failure("UserGroup_001", "User group not found.");
        }

        if (entity.Members.Any())
        {
            _context.GetSet<UserGroupMember>().RemoveRange(entity.Members);
        }

        _context.GetSet<UserGroup>().Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteUserGroupResponse>.Success(new());
    }
}
