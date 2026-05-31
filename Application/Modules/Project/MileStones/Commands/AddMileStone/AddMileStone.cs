using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Tenant;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.MileStones.Commands.AddMileStone;

public record AddMileStoneCommand : IRequest<Result<AddMileStoneResponse>>
{
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddMileStoneCommand, Novologs.Domain.Entities.ProjectMileStone>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));
        }
    }
}

public class AddMileStoneResponse
{
    public Guid Id { get; set; }
}

public class AddMileStoneCommandValidator : AbstractValidator<AddMileStoneCommand>
{
    public AddMileStoneCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");
        RuleFor(v => v.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == projectId, cancellationToken);
            }).WithMessage("ProjectId is invalid.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");
        RuleFor(v => v.Name)
            .MustAsync(async (model, name, cancellationToken) =>
            {
                return !await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .AnyAsync(m => m.ProjectId == model.ProjectId && m.Name.Trim().ToLower() == name.Trim().ToLower(),
                        cancellationToken);
            }).WithMessage("Name already exists in the project.");

        RuleFor(v => v.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(2048 * 4).WithMessage("Description must not exceed 8192 characters.");
        RuleFor(v => v.StartDate)
            .NotEmpty().WithMessage("StartDate is required.");
        RuleFor(v => v.DueDate)
            .NotEmpty().WithMessage("DueDate is required.")
            .GreaterThanOrEqualTo(v => v.StartDate).WithMessage("DueDate must be greater than or equal to StartDate.");
    }
}

public class AddMileStoneCommandHandler : IRequestHandler<AddMileStoneCommand, Result<AddMileStoneResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddMileStoneCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddMileStoneResponse>> Handle(AddMileStoneCommand request,
        CancellationToken cancellationToken)
    {
        var mileStone = _mapper.Map<Novologs.Domain.Entities.ProjectMileStone>(request);
        await _context.GetSet<Novologs.Domain.Entities.ProjectMileStone>().AddAsync(mileStone, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        
        var projectFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f => f.Type == FolderType.Shared && f.ProjectId == request.ProjectId, cancellationToken);
        if (projectFolder != null)
        {
            var mileStoneFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
            {
                Name = mileStone.Name,
                Type = FolderType.Shared,
                ParentFolderId = projectFolder.Id,
                IsFile = false,
                CreatorId = Guid.Parse(_user.Id!),
                MilestoneId = mileStone.Id
            };
            await _context.GetSet<Novologs.Domain.Entities.Folder>().AddAsync(mileStoneFolder, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result<AddMileStoneResponse>.Success(new AddMileStoneResponse() { Id = mileStone.Id });
    }
}
