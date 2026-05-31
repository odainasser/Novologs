using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.SalesTargets.Queries.GetSalesTarget;

public record GetSalesTargetQuery : IRequest<Result<GetSalesTargetResponse>>
{
    public Guid? UserId { get; set; }
    public int? Year { get; set; }
}

public class GetSalesTargetResponse
{
    public decimal Total { get; set; }
    public List<SalesTargetDto> Items { get; set; } = new();
}

public class SalesTargetDto
{
    public Guid? Id { get; set; }
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public decimal AchivedValue { get; set; }
    public Guid UserId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<SalesTarget, SalesTargetDto>();
        }
    }
}

public class GetSalesTargetQueryValidator : AbstractValidator<GetSalesTargetQuery>
{
    public GetSalesTargetQueryValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.UserId)
            .MustAsync(async (userId, cancellationToken) =>
            {
                if (userId == null) return true;
                return await context.GetSet<TenantUser>().AnyAsync(u => u.Id == userId, cancellationToken);
            })
            .WithMessage("User not found.")
            .When(v => v.UserId != null);

        RuleFor(v => v.Year)
            .GreaterThan(1950).WithMessage("Year must be greater than 1950.")
            .LessThan(2050).WithMessage("Year must be less than 2050.")
            .When(v => v.Year != null);
    }
}

public class GetSalesTargetQueryHandler : IRequestHandler<GetSalesTargetQuery, Result<GetSalesTargetResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;

    public GetSalesTargetQueryHandler(ITenantDbContext context, IUser user, IMapper mapper,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<Result<GetSalesTargetResponse>> Handle(GetSalesTargetQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetSalesTargetResponse();
        var query = _context.GetSet<SalesTarget>()
            .AsNoTracking().AsSplitQuery();
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetSalesTargetResponse>.Failure("SalesTarget_001", "User not found.");
        }

        var hasPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Clients.ReadSalesTarget);
        if (request.UserId != null && hasPermission)
        {
            query = query.Where(st => st.UserId == request.UserId);
        }
        else
        {
            query = query.Where(st => st.UserId == userId);
        }

        if (request.Year != null)
        {
            query = query.Where(st => st.Date.Year == request.Year);
        }

        result.Total = await query.SumAsync(st => st.Value, cancellationToken);

        var targets = await query.OrderBy(st => st.Date).ProjectTo<SalesTargetDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        var awardedSales = await _context.GetSet<ClientLead>()
            .Where(cl => cl.CreatorId == request.UserId &&
                         cl.LeadStatus == LeadStatus.Awarded &&
                         cl.AwardedDate.HasValue &&
                         cl.AwardedDate.Value.Year == request.Year)
            .ToListAsync(cancellationToken);

        var existingTargets = targets.ToDictionary(st => st.Date.Month);
        var allMonths = Enumerable.Range(1, 12);
        result.Items = allMonths.Select(month =>
        {
            if (existingTargets.TryGetValue(month, out var target))
            {
                return target;
            }
            else
            {
                return new SalesTargetDto
                {
                    Date = new DateTime(request.Year!.Value, month, 1), Value = 0, UserId = request.UserId!.Value
                };
            }
        }).OrderBy(st => st.Date).ToList();

        foreach (var item in result.Items)
        {
            item.AchivedValue = (decimal)awardedSales
                .Where(cl => cl.AwardedDate!.Value.Month == item.Date.Month)
                .Sum(cl => cl.AwardedValue!.Value);
        }

        return Result<GetSalesTargetResponse>.Success(result);
    }
}
