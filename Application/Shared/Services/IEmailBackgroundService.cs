using Hangfire;

namespace SystemLoaders.Services;

public interface IEmailBackgroundService
{
    [Queue("emails")]
    Task SendEmailAsync(EmailData emailData);
}

public class EmailData
{
    public EmailTemplate EmailTemplate { get; set; } = EmailTemplate.None;
    public List<EmailUserInfo> UserInfo { get; set; } = new();

    public Guid? TenantId { get; set; }
    public string? Subject { get; set; }
    public string? Message { get; set; }
    public string? ActionLink { get; set; }
    public Dictionary<string, string>? Data { get; set; } = new();
    public int RetryCount { get; set; } = 0;
}

public enum EmailTemplate : short
{
    None = 0,
    RegistrationConfirmEmail = 1,
    RegistrationResetPasswordEmail = 2,
    CompanyConfirmEmail = 3,
    CompanyResetPasswordEmail = 4,
    NotificationEmail = 5
}

public class EmailUserInfo
{
    public string Email { get; set; } = null!;
    public Guid? Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

 
public class TemplateData
{
    public required EmailUserInfo EmailUser { get; set; }
    public required EmailData Data { get; set; }
}