using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.SalesTargets.Commands.UpdateSalesTarget;

public record UpdateSalesTargetCommand : IRequest<Result<UpdateSalesTargetResponse>>
{
    public Guid Id { get; set; }
    public DateTime? Date { get; set; }
    public decimal? Value { get; set; }
    public Guid? UserId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateSalesTargetCommand, SalesTarget>()
                .ForMember(dest => dest.Date, opt => opt.Condition(src => src.Date != null))
                .ForMember(dest => dest.Date,
                    opt => opt.MapFrom(src =>
                        src.Date != null ? new DateTime(src.Date.Value.Year, src.Date.Value.Month, 1) : default))
                .ForMember(dest => dest.Value, opt => opt.Condition(src => src.Value != null))
                .ForMember(dest => dest.UserId, opt => opt.Condition(src => src.UserId != null));
        }
    }
}

public class UpdateSalesTargetResponse
{
}

public class UpdateSalesTargetCommandValidator : AbstractValidator<UpdateSalesTargetCommand>
{
    public UpdateSalesTargetCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<SalesTarget>().AnyAsync(st => st.Id == id, cancellationToken);
            })
            .WithMessage("Sales target not found.");

        RuleFor(v => v.Value)
            .GreaterThan(0).WithMessage("Value must be greater than 0.")
            .When(v => v.Value != null);

        RuleFor(v => v.UserId)
            .MustAsync(async (userId, cancellationToken) =>
            {
                if (userId == null) return true;
                return await context.GetSet<TenantUser>().AnyAsync(u => u.Id == userId, cancellationToken);
            })
            .WithMessage("User not found.")
            .When(v => v.UserId != null);

        RuleFor(v => new { v.Date, v.UserId, v.Id })
            .MustAsync(async (command, cancellationToken) =>
            {
                if (command.Date == null && command.UserId == null) return true;

                var salesTarget = await context.GetSet<SalesTarget>()
                    .FirstOrDefaultAsync(st => st.Id == command.Id, cancellationToken);

                if (salesTarget == null) return false; // Should be caught by the Id rule

                var dateToCheck = command.Date ?? salesTarget.Date;
                var userIdToCheck = command.UserId ?? salesTarget.UserId;

                return !await context.GetSet<SalesTarget>()
                    .AnyAsync(
                        st => st.Date.Date.Year == dateToCheck.Date.Year &&
                              st.Date.Date.Month == dateToCheck.Date.Month
                              && st.UserId == userIdToCheck && st.Id != command.Id,
                        cancellationToken);
            })
            .WithMessage("Sales target for this user and date already exists.");
    }
}

public class
    UpdateSalesTargetCommandHandler : IRequestHandler<UpdateSalesTargetCommand, Result<UpdateSalesTargetResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public UpdateSalesTargetCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<UpdateSalesTargetResponse>> Handle(UpdateSalesTargetCommand request,
        CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<SalesTarget>()
            .FirstOrDefaultAsync(st => st.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<UpdateSalesTargetResponse>.Failure("SalesTarget_001", "Sales target not found.");
        }

        _mapper.Map(request, entity);

        _context.GetSet<SalesTarget>().Update(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateSalesTargetResponse>.Success(new());
    }
}
