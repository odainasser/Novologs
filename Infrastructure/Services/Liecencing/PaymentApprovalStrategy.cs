using System.Threading.Tasks;
using Novologs.Application.Common.Models;

namespace Novologs.Infrastructure.Services;

public class PaymentApprovalStrategy : IPricingPolicyStrategy
{
    public Task<Result> Evaluate(TenantPolicy policy)
    {
        if (!policy.PaymentApproval)
        { 
            return Task.FromResult(Result.Failure("Policy Error","Payment not approved"));

        }

        return Task.FromResult(Result.Success());
    }
}
