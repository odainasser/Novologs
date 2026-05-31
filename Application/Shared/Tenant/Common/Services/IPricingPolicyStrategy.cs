using System.Threading.Tasks;
using Novologs.Application.Common.Models;

namespace Novologs.Infrastructure.Services;

public class TenantPolicy
{
    public int MaxUsers { get; set; }
    public int MaxStorageGB { get; set; }
    public double AlertStoragePercentage { get; set; } = 0.95;
    public DateTime LicenseStartDate { get; set; }
    public int LicenseDurationMonths { get; set; }
    public bool PaymentApproval { get; set; }
    public string? SupportEmail { get; set; }
}

public interface IPricingPolicyStrategy
{
    Task<Result> Evaluate(TenantPolicy policy);
}

public interface IMaxUserCountStrategy
{
    Task<Result> Evaluate(TenantPolicy policy);
}

public interface ICurentUserCountStrategy
{
    Task<Result> Evaluate(TenantPolicy policy, Guid userId);
}
