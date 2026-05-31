using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.UserGroups.Commands.AddUserGroup;

public record AddUserGroupCommand : IRequest<Result<AddUserGroupResponse>>
{
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public List<Guid> MemberIds { get; set; } = new();

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddUserGroupCommand, UserGroup>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name.Trim()))
                .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Code != null ? src.Code.Trim() : null))
                .ForMember(dest => dest.Members, opt => opt.Ignore())
                ;
        }
    }
}

public class AddUserGroupResponse
{
    public Guid Id { get; set; }
}

public class AddUserGroupCommandValidator : AbstractValidator<AddUserGroupCommand>
{
    public AddUserGroupCommandValidator(ITenantDbContext context, IUser user)
    {
        //name and code should be uniqe, members ids should be valid tenantuser ids with no duplication
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.")
            .MustAsync(async (name, cancellationToken) =>
                await context.GetSet<UserGroup>().AllAsync(l => l.Name.ToLower().Trim() != name.ToLower().Trim(),
                    cancellationToken))
            .WithMessage("The specified name already exists.");

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (code, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(code)) return true;
                return await context.GetSet<UserGroup>()
                    .AllAsync(l => l.Code == null || l.Code.ToLower().Trim() != code.ToLower().Trim(),
                        cancellationToken);
            })
            .WithMessage("The specified code already exists.");

        RuleFor(v => v.MemberIds)
            .Must(memberIds => memberIds.Distinct().Count() == memberIds.Count)
            .WithMessage("Member IDs must be unique.");

        RuleForEach(v => v.MemberIds)
            .MustAsync(async (memberId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>().AnyAsync(u => u.Id == memberId, cancellationToken);
            })
            .WithMessage("One or more member IDs are invalid.");
    }
}

public class AddUserGroupCommandHandler : IRequestHandler<AddUserGroupCommand, Result<AddUserGroupResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public AddUserGroupCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<AddUserGroupResponse>> Handle(AddUserGroupCommand request,
        CancellationToken cancellationToken)
    {
        var entity = _mapper.Map<UserGroup>(request);
        entity.CreatorUserId = _user.IdGuid;

        foreach (var memberId in request.MemberIds)
        {
            entity.Members.Add(new() { UserId = memberId });
        }

        _context.GetSet<UserGroup>().Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddUserGroupResponse>.Success(new() { Id = entity.Id });
    }
}
