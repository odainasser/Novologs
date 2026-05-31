using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.Modules.Tasks.Statuses.Commands.AddStatus;
using Novologs.Application.Modules.Tasks.Statuses.Commands.DeleteStatus;
using Novologs.Application.Modules.Tasks.Statuses.Commands.UpdateStatus;
using Novologs.Application.Modules.Tasks.Statuses.Queries.GetStatus;
using Novologs.Api.Infrastructure;

namespace Novologs.Api.Endpoints.Task;

public class Statuses : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Status").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/addStatus", AddStatus);
        manageGroup.MapPut("/updateStatus", UpdateStatus);
        manageGroup.MapDelete("/deleteStatus/{id}", DeleteStatus);
        manageGroup.MapPost("/getStatus", GetStatus);
    }

    private async Task<Result<GetStatusResponse>> GetStatus([FromServices] ISender sender,
        [FromBody] GetStatusQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteStatusResponse>> DeleteStatus([FromServices] ISender sender, Guid id)
    {
        //TODO Add authorization checks (my created )
        var command = new DeleteStatusCommand() { Id = id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateStatusResponse>> UpdateStatus([FromServices] ISender sender,
        [FromBody] UpdateStatusCommand command)
    {
        //TODO Test
        //TODO Add authorization checks (my created)
        return await sender.Send(command);
    }

    private async Task<Result<AddStatusResponse>> AddStatus([FromServices] ISender sender,
        [FromBody] AddStatusCommand command)
    {
        //TODO Add authorization checks (members level, no assign task permission )
        return await sender.Send(command);
    }
}
