namespace Microsoft.Extensions.DependencyInjection.Endpoints;

using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Project.TaskTypes.Commands.AddTaskType;
using Novologs.Application.Modules.Project.TaskTypes.Commands.DeleteTaskType;
using Novologs.Application.Modules.Project.TaskTypes.Commands.UpdateTaskType;
using Novologs.Application.Modules.Project.TaskTypes.Queries.GetTaskType;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

public class TaskTypes : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        //TODO Add authorization
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getTaskTypes", GetTaskTypes);
        manageGroup.MapPost("/addTaskType", AddTaskType);
        manageGroup.MapDelete("/deleteTaskType/{id}", DeleteTaskType);
        manageGroup.MapPut("/updateTaskType", UpdateTaskType);
    }

    private async Task<Result<AddTaskTypeResponse>> AddTaskType([FromBody] AddTaskTypeCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetTaskTypeResponse>> GetTaskTypes([FromBody] GetTaskTypeQuery query,
        [FromServices] ISender sender)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteTaskTypeResponse>> DeleteTaskType([FromServices] ISender sender, Guid Id)
    {
        var command = new DeleteTaskTypeCommand() { Id = Id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateTaskTypeResponse>> UpdateTaskType([FromBody] UpdateTaskTypeCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }
}
