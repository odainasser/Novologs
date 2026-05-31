using System;
using System.Threading.Tasks;
using Novologs.Application.Common.Models;

namespace Novologs.Infrastructure.Services;

public class LicenseTimeStrategy : IPricingPolicyStrategy
{
    public Task<Result> Evaluate(TenantPolicy policy)
    {
        var licenseEndDate = policy.LicenseStartDate.AddMonths(policy.LicenseDurationMonths);
        if (DateTime.UtcNow > licenseEndDate)
        {
            return Task.FromResult(Result.Failure("Policy Error","License expired"));
        }

        return Task.FromResult(Result.Success());
    } 
}
