using Novologs.Application.Notifications.Commands.SetNotificationIsRead;
using Novologs.Application.Notifications.Queries.GetNotification;
using Novologs.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Notifications.Commands.ClearNotification;

namespace Novologs.Api.Endpoints.Tenant;

public class Notification : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getNotification", GetNotification);
        manageGroup.MapPut("/setNotificationIsRead", SetNotificationIsRead);

        manageGroup.MapDelete("/clearNotification", ClearNotification);
    }

    private async Task<Result<ClearNotificationResponse>> ClearNotification([FromServices] ISender sender)
    {
        return await sender.Send(new ClearNotificationCommand());
    }

    private async Task<Result<GetNotificationResponse>> GetNotification([FromServices] ISender sender,
        [FromBody] GetNotificationQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<SetNotificationIsReadResponse>> SetNotificationIsRead([FromServices] ISender sender,
        [FromBody] SetNotificationIsReadCommand command)
    {
        return await sender.Send(command);
    }
}
