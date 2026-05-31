using System.Text.Json;
using System.Threading.Tasks;
using Finbuckle.MultiTenant;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Services;
using Novologs.Domain.Constants;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.Modules.Folder.Folders.Commands.AddFolder;

public class FolderPolicyService : IFolderPolicyService
{
    private readonly ICurrentTenant _currentTenant;
    private readonly ITenantDbContext _context;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IRegistrationDbContext _registrationDbContext;

    public FolderPolicyService(ICurrentTenant currentTenant,
        ITenantDbContext context,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        UserManager<TenantUser> userManager,
        IRegistrationDbContext registrationDbContext
    )
    {
        _currentTenant = currentTenant;
        _context = context;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _userManager = userManager;
        _registrationDbContext = registrationDbContext;
    }

    public async Task<Result> ValidateStoragePolicy(long fileSize)
    {
        // Get fresh policy from database instead of cached version to avoid stale data
        var tenantId = _currentTenant?.TenantInfo?.Id;
        if (tenantId == null)
        {
            return Result.Success();
        }

        // Fetch fresh tenant info from registration database
        var freshTenantInfo = await _registrationDbContext.GetSet<AppTenantInfo>()
            .FirstOrDefaultAsync(x => x.Id == tenantId);
        
        var policyJson = freshTenantInfo?.Policy;
        if (string.IsNullOrEmpty(policyJson))
        {
            return Result.Success();
        }

        var policy = JsonSerializer.Deserialize<TenantPolicy>(policyJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (policy == null)
        {
            return Result.Failure("TenantPolicy.Deserialization", "Failed to deserialize tenant policy.");
        }

        //max storage is <0 then unlimited 
        if (policy.MaxStorageGB < 0)
        {
            return Result.Success();
        }

        var currentStorageUsage = GetCurrentStorageUsage();
        var maxStorageBytes = policy.MaxStorageGB * 1024L * 1024L * 1024L;
        var currentStorageGB = currentStorageUsage / (1024.0 * 1024.0 * 1024.0);
        var fileSizeGB = fileSize / (1024.0 * 1024.0 * 1024.0);
        
        // Debug: Log the values
        Console.WriteLine($"DEBUG - Policy JSON: {policyJson}");
        Console.WriteLine($"DEBUG - MaxStorageGB from policy: {policy.MaxStorageGB}");
        Console.WriteLine($"DEBUG - Current Storage Usage (bytes): {currentStorageUsage}");
        Console.WriteLine($"DEBUG - Current Storage Usage (GB): {currentStorageGB:F2}");
        Console.WriteLine($"DEBUG - File Size (bytes): {fileSize}");
        Console.WriteLine($"DEBUG - File Size (GB): {fileSizeGB:F4}");
        Console.WriteLine($"DEBUG - Max Storage (bytes): {maxStorageBytes}");
        
        if (currentStorageUsage + fileSize > maxStorageBytes)
        {
            return Result.Failure("Folder_005", $"company file quta of {policy.MaxStorageGB} GB is depleted. Current usage: {currentStorageGB:F2} GB, Attempting to add: {fileSizeGB:F4} GB");
        }

        if (currentStorageUsage >= policy.MaxStorageGB * 1024L * 1024L * 1024L * policy.AlertStoragePercentage)
        {
            //todo maybe this sent a lot of emails maybe need to make it a background job to sent it once a day
            await SendAlert(policy, currentStorageUsage);
        }


        return Result.Success();
    }

    private long GetCurrentStorageUsage()
    {
        return _context.GetSet<Novologs.Domain.Entities.Folder>().Where(x => x.IsFile)
            .Sum(x => x.Size ?? 0);
    }

    private async Task SendAlert(TenantPolicy policy, long currentStorageUsage)
    {
        var tenantInfo = _currentTenant?.TenantInfo;
        var totalStorageBytes = policy.MaxStorageGB * 1024L * 1024L * 1024L;
        var actualPercentage = (double)currentStorageUsage / totalStorageBytes;
        var usedGB = currentStorageUsage / (1024.0 * 1024.0 * 1024.0);
        
        var emailSubject = $"Storage Usage Alert for {tenantInfo?.Name}";
        var emailMessage =
            $"Your company's storage usage has reached {actualPercentage:P} ({usedGB:F2} GB) of its {policy.MaxStorageGB} GB limit.";

        var emailData = new EmailData()
        {
            TenantId = tenantInfo?.Id,
            EmailTemplate = EmailTemplate.NotificationEmail,
            Subject = emailSubject,
            Message = emailMessage
        };
        if (!string.IsNullOrEmpty(policy.SupportEmail))
        {
            emailData.UserInfo = new List<EmailUserInfo>()
            {
                new()
                {
                    Email = policy.SupportEmail,
                    FirstName = "Support"
                }
            };
        }
        else
        {
            var superAdmins = await _userManager.GetUsersInRoleAsync(Novologs.Domain.Constants.Roles.SuperAdmin);
            var adminUsers = superAdmins;
            
            var generalAdmins = await _userManager.GetUsersInRoleAsync(Novologs.Domain.Constants.Roles.GeneralAdmin);
            adminUsers = adminUsers.Concat(generalAdmins).DistinctBy(u => u.Id).ToList();

            if (adminUsers.Any())
            {
                emailData.UserInfo = adminUsers.Select(adminUser => new EmailUserInfo()
                {
                    Email = adminUser.Email!,
                    FirstName = adminUser.FullName
                }).ToList();
            }
        }

        _sendEmailAndNotificationService.SendEmail(emailData);
    }
}
