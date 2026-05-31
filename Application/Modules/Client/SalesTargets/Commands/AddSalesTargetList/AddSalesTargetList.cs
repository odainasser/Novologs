using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.SalesTargets.Commands.AddSalesTargetList;

public record AddUpdateSalesTargetListCommand : IRequest<Result<AddUpdateSalesTargetListResponse>>
{
    public List<TargetItemDto> Targets { get; set; } = new();
    public Guid UserId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddUpdateSalesTargetListCommand, SalesTarget>();
        }
    }
}

public class TargetItemDto
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
}

public class AddUpdateSalesTargetListResponse
{
    public List<Guid> Ids { get; set; } = new();
}

public class AddUpdateSalesTargetListCommandValidator : AbstractValidator<AddUpdateSalesTargetListCommand>
{
    public AddUpdateSalesTargetListCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .MustAsync(async (userId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>().AnyAsync(u => u.Id == userId, cancellationToken);
            })
            .WithMessage("User not found.");

        RuleFor(v => v.Targets)
            .NotEmpty().WithMessage("Targets list cannot be empty.");

        RuleForEach(v => v.Targets).ChildRules(target =>
        {
            target.RuleFor(x => x.Date)
                .NotEmpty().WithMessage("Date is required for each target item.");

            target.RuleFor(x => x.Value)
                .GreaterThanOrEqualTo(0).WithMessage("Value must be greater than 0 for each target item.");
        });

        RuleFor(v => v.Targets)
            .Must((list, targets, context) =>
            {
                var distinctDates = targets.Select(t => new DateTime(t.Date.Year, t.Date.Month, 1)).Distinct();
                return distinctDates.Count() == targets.Count;
            }).WithMessage("Duplicate target dates (month and year) are not allowed within the list.");
    }
}

public class AddUpdateSalesTargetListCommandHandler : IRequestHandler<AddUpdateSalesTargetListCommand,
    Result<AddUpdateSalesTargetListResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public AddUpdateSalesTargetListCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<AddUpdateSalesTargetListResponse>> Handle(AddUpdateSalesTargetListCommand request,
        CancellationToken cancellationToken)
    {
        var response = new AddUpdateSalesTargetListResponse();

        var targetsYears = request.Targets.Select(t => t.Date.Year);
        var salesTargetList = await _context.GetSet<SalesTarget>()
            .Where(st => st.UserId == request.UserId &&
                         targetsYears.Contains(st.Date.Year))
            .ToListAsync(cancellationToken);

        foreach (var targetDto in request.Targets)
        {
            var salesTarget = salesTargetList
                .FirstOrDefault(st => st.UserId == request.UserId &&
                                      st.Date.Year == targetDto.Date.Year &&
                                      st.Date.Month == targetDto.Date.Month);

            if (salesTarget == null)
            {
                salesTarget = new SalesTarget()
                {
                    Date = new DateTime(targetDto.Date.Year, targetDto.Date.Month, 1).ToUniversalTime(),
                    Value = targetDto.Value,
                    UserId = request.UserId
                };
                _context.GetSet<SalesTarget>().Add(salesTarget);
            }
            else
            {
                salesTarget.Value = targetDto.Value;
                _context.GetSet<SalesTarget>().Update(salesTarget);
            }

            response.Ids.Add(salesTarget.Id);
        }
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddUpdateSalesTargetListResponse>.Success(response);
    }
}
