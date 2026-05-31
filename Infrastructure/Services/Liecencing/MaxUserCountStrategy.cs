using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Infrastructure.Services;

public class MaxUserCountStrategy : IMaxUserCountStrategy
{
    private readonly ITenantDbContext _context;

    public MaxUserCountStrategy(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Evaluate(TenantPolicy policy)
    {
        var userCount = await _context.GetSet<Domain.Entities.TenantUser>().CountAsync();
        if (userCount >= policy.MaxUsers)
        {
            return Result.Failure("Policy Error", "User quota exceeded");
        }

        return Result.Success();
    }
}
