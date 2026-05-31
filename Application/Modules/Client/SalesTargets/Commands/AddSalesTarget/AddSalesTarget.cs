using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.SalesTargets.Commands.AddSalesTarget;

public record AddSalesTargetCommand : IRequest<Result<AddSalesTargetResponse>>
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public Guid UserId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddSalesTargetCommand, SalesTarget>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => new DateTime(src.Date.Year, src.Date.Month, 1)))
                ;
        }
    }
}

public class AddSalesTargetResponse
{
    public Guid Id { get; set; }
}

public class AddSalesTargetCommandValidator : AbstractValidator<AddSalesTargetCommand>
{
    public AddSalesTargetCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Date)
            .NotEmpty().WithMessage("Date is required.");

        RuleFor(v => v.Value)
            .GreaterThan(0).WithMessage("Value must be greater than 0.");

        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .MustAsync(async (userId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>().AnyAsync(u => u.Id == userId, cancellationToken);
            })
            .WithMessage("User not found.");

        RuleFor(v => new { v.Date, v.UserId })
            .MustAsync(async (command, cancellationToken) =>
            {
                return !await context.GetSet<SalesTarget>()
                    .AnyAsync(
                        st => st.Date.Date.Year == command.Date.Date.Year &&
                              st.Date.Date.Month == command.Date.Date.Month && 
                              st.UserId == command.UserId,
                        cancellationToken);
            })
            .WithMessage("Sales target for this user and date already exists.");
    }
}

public class AddSalesTargetCommandHandler : IRequestHandler<AddSalesTargetCommand, Result<AddSalesTargetResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public AddSalesTargetCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<AddSalesTargetResponse>> Handle(AddSalesTargetCommand request,
        CancellationToken cancellationToken)
    {
        var entity = _mapper.Map<SalesTarget>(request);

        _context.GetSet<SalesTarget>().Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddSalesTargetResponse>.Success(new() { Id = entity.Id });
    }
}
