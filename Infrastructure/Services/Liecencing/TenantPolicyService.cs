using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Finbuckle.MultiTenant;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Services;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Services;

public class TenantPolicyService : ITenantPolicyService
{
    private readonly ICurrentTenant _currentTenant;
    private readonly IEnumerable<IPricingPolicyStrategy> _strategies;
    private readonly ICurentUserCountStrategy _currentUserCountStrategy;
    private readonly IMaxUserCountStrategy _maxUsersCountStrategy;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly UserManager<TenantUser> _userManager;
    private readonly string? policyJson;
    private readonly TenantPolicy? policy;

    public TenantPolicyService(ICurrentTenant currentTenant, IEnumerable<IPricingPolicyStrategy> strategies,
        ICurentUserCountStrategy currentUserCountStrategy,
        IMaxUserCountStrategy maxUsersCountStrategy,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        UserManager<TenantUser> userManager
    )
    {
        _currentTenant = currentTenant;
        _strategies = strategies;
        _currentUserCountStrategy = currentUserCountStrategy;
        _maxUsersCountStrategy = maxUsersCountStrategy;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _userManager = userManager;
        policyJson = _currentTenant.TenantInfo?.Policy;
        if (!string.IsNullOrEmpty(policyJson))
        {
            policy = JsonSerializer.Deserialize<TenantPolicy>(policyJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
    }

    public async Task<Result> ValidatePolicies()
    {
        if (string.IsNullOrEmpty(policyJson))
        {
            return Result.Success();
        }

        if (policy == null)
        {
            return Result.Failure("TenantPolicy.Deserialization", "Failed to deserialize tenant policy.");
        }

        foreach (var strategy in _strategies)
        {
            var result = await strategy.Evaluate(policy);
            if (!result.Succeeded)
            {
                //todo maybe this sent a lot of emails maybe need to make it a background job to sent it once a day
                await SendAlert(result);

                return result;
            }
        }

        return Result.Success();
    }

    public Task<Result> ValidateCurrentUserPolicies(Guid userId)
    {
        if (string.IsNullOrEmpty(policyJson))
        {
            return Task.FromResult(Result.Success());
        }

        if (policy == null)
        {
            return Task.FromResult(Result.Failure("TenantPolicy.Deserialization",
                "Failed to deserialize tenant policy."));
        }

        return _currentUserCountStrategy.Evaluate(policy, userId);
    }

    public Task<Result> ValidateMaxUserCountPolicy()
    {
        if (string.IsNullOrEmpty(policyJson))
        {
            return Task.FromResult(Result.Success());
        }

        if (policy == null)
        {
            return Task.FromResult(Result.Failure("TenantPolicy.Deserialization",
                "Failed to deserialize tenant policy."));
        }

        return _maxUsersCountStrategy.Evaluate(policy);
    } 

    private async Task SendAlert(Result result)
    {
        var tenantInfo = _currentTenant?.TenantInfo;
        var emailSubject = $"Policy Violation Alert for {tenantInfo?.Name}";
        var emailMessage =
            $"A policy violation has occurred: {string.Join(", ", result.Errors.Select(e => $"{e.Code} - {e.Description}"))}";

        var emailData = new EmailData()
        {
            TenantId = tenantInfo?.Id,
            EmailTemplate = EmailTemplate.NotificationEmail,
            Subject = emailSubject,
            Message = emailMessage
        };

        if (!string.IsNullOrEmpty(policy?.SupportEmail))
        {
            emailData.UserInfo = new List<EmailUserInfo>()
            {
                new() { Email = policy.SupportEmail, FirstName = "Support" }
            };
        }
        else
        {
            var superAdmins = await _userManager.GetUsersInRoleAsync(Roles.SuperAdmin);
            var adminUsers = superAdmins;

            var generalAdmins = await _userManager.GetUsersInRoleAsync(Roles.GeneralAdmin);
            adminUsers = adminUsers.Concat(generalAdmins).DistinctBy(u => u.Id).ToList();

            if (adminUsers.Any())
            {
                emailData.UserInfo = adminUsers.Select(adminUser => new EmailUserInfo()
                {
                    Email = adminUser.Email!, FirstName = adminUser.FullName
                }).ToList();
            }
        }

        _sendEmailAndNotificationService.SendEmail(emailData);
    }
}
