using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SystemLoaders.Services;

public class SendEmailAndNotificationService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SendEmailAndNotificationService> _logger;
    private readonly IBackgroundJobClient _jobClient;

    public SendEmailAndNotificationService(
        IConfiguration configuration,
        ILogger<SendEmailAndNotificationService> logger,
        IBackgroundJobClient jobClient)
    {
        _configuration = configuration;
        _logger = logger;
        _jobClient = jobClient;
    }

    public void SendEmail(EmailData emailData)
    {
        var jobId = _jobClient.Enqueue<IEmailBackgroundService>(service => service.SendEmailAsync(emailData));
        _logger.LogInformation("Email job enqueued with ID: {JobId} for template {Template}", jobId,
            emailData.EmailTemplate);
    }

    public void SendNotification(NotificationData notificationData)
    {
        var jobId = _jobClient.Enqueue<INotificationBackgroundService>(service =>
            service.SendNotificationAsync(notificationData));
        _logger.LogInformation("Notification job enqueued with ID: {JobId} for title {Title}", jobId,
            notificationData.Title);
    }

    public void SendNotification(NotificationData notificationData, DateTime date)
    {
        var jobId = _jobClient.Schedule<INotificationBackgroundService>(service =>
            service.SendNotificationAsync(notificationData), date);
        _logger.LogInformation("Scheduled Notification job enqueued with ID: {JobId} for title {Title} at {Date}",
            jobId,
            notificationData.Title, date);
    }
}