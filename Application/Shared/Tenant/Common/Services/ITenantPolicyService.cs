using System.Threading.Tasks;
using Novologs.Application.Common.Models;

namespace Novologs.Infrastructure.Services;

public interface ITenantPolicyService
{
    Task<Result> ValidatePolicies();
    Task<Result> ValidateCurrentUserPolicies(Guid userId);
    Task<Result> ValidateMaxUserCountPolicy();
}
