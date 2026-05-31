using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Project.MileStones.Commands.UpdateMileStone;

public record UpdateMileStoneCommand : IRequest<Result<UpdateMileStoneResponse>>
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public string? Name { get; set; } = null!;
    public string? Description { get; set; } = null!;
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateMileStoneCommand, Novologs.Domain.Entities.ProjectMileStone>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null))
                ;
        }
    }
}

public class UpdateMileStoneResponse
{
}

public class UpdateMileStoneCommandValidator : AbstractValidator<UpdateMileStoneCommand>
{
    public UpdateMileStoneCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .AnyAsync(p => p.Id == id, cancellationToken);
            }).WithMessage("Invalid Milestone Id");

        RuleFor(v => v.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
            {
                if (!projectId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == projectId, cancellationToken);
            }).WithMessage("ProjectId is invalid.");

        RuleFor(v => v.Name)
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");
        RuleFor(v => v.Name)
            .MustAsync(async (model, name, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(name)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .AnyAsync(
                        m => m.ProjectId == model.ProjectId && m.Name.Trim().ToLower() == name.Trim().ToLower() &&
                             m.Id != model.Id,
                        cancellationToken);
            }).WithMessage("Name already exists in the project.");

        RuleFor(v => v.Description)
            .MaximumLength(2048 * 4).WithMessage("Description must not exceed 8192 characters.");
        RuleFor(v => v.DueDate)
            .GreaterThanOrEqualTo(v => v.StartDate).WithMessage("DueDate must be greater than or equal to StartDate.");
    }
}

public class UpdateMileStoneCommandHandler : IRequestHandler<UpdateMileStoneCommand, Result<UpdateMileStoneResponse>>
{
    private readonly ITenantDbContextFactory _dbContextFactory;
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateMileStoneCommandHandler(ITenantDbContextFactory dbContextFactory, IMapper mapper)
    {
        _dbContextFactory = dbContextFactory;
        _context = _dbContextFactory.CreateDbContext();
        _mapper = mapper;
    }

    public async Task<Result<UpdateMileStoneResponse>> Handle(UpdateMileStoneCommand request,
        CancellationToken cancellationToken)
    {
        var mileStone = await _context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
            .FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken);
        if (mileStone == null)
        {
            return Result<UpdateMileStoneResponse>.Failure("ProjectMilestone_003", "MileStone not found.");
        }

        _mapper.Map(request, mileStone);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateMileStoneResponse>.Success(new UpdateMileStoneResponse());
    }
}
