using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Infrastructure.Services;

public class CurentUserCountStrategy : ICurentUserCountStrategy
{
    private readonly ITenantDbContext _context;

    public CurentUserCountStrategy(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Evaluate(TenantPolicy policy, Guid userId)
    {
        var userCount = await _context.GetSet<Domain.Entities.TenantUser>().CountAsync();
        if (userCount >= policy.MaxUsers)
        {
            var allowedUsers = await _context.GetSet<Domain.Entities.TenantUser>()
                .OrderBy(u => u.Created)
                .Take(policy.MaxUsers)
                .Select(u => u.Id)
                .ToListAsync();

            if (!allowedUsers.Contains(userId))
            {
                return Result.Failure("Policy Error", "User quota exceeded. This user is not among the allowed users.");
            }
        }

        return Result.Success();
    }
}
