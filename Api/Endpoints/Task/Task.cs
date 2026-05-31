using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.Modules.Tasks.Tasks.Commands.CreateTask;
using Novologs.Application.Modules.Tasks.Tasks.Commands.DeleteTask;
using Novologs.Application.Modules.Tasks.Tasks.Commands.UpdateTask;
using Novologs.Application.Modules.Tasks.Tasks.Queries.GetTask;
using Novologs.Application.Modules.Tasks.Tasks.Queries.GetTaskQuery;
using Novologs.Application.Modules.Tasks.Tasks.Commands.ChangeTaskStatus;
using Novologs.Application.Modules.Tasks.Tasks.Commands.TranscribeTask;
using Novologs.Application.Modules.Tasks.Tasks.Dto;
using Novologs.Application.Modules.Tasks.Tasks.Queries.GetTaskAvailableUsers;
using Novologs.Domain.Entities;
using Novologs.Api.Infrastructure;

namespace Novologs.Api.Endpoints.Task;

public class Tasks : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Task").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/createTask", CreateTask);
        manageGroup.MapPut("/updateTask", UpdateTask);
        manageGroup.MapDelete("/deleteTask/{id}", DeleteTask);
        manageGroup.MapGet("/getTask/{id}", GetTask);
        manageGroup.MapPost("/getTaskQuery", GetTaskQuery);
        manageGroup.MapPost("/changeStatus", ChangeStatus);
        manageGroup.MapPost("/getTaskAvailableUsers", GetTaskAvailableUsers);
        manageGroup.MapPost("/transcribeTask", TranscribeTask);
    }

    private async Task<Result<GetTaskAvailableUsersResponse>> GetTaskAvailableUsers([FromServices] ISender sender,
        [FromBody] GetTaskAvailableUsersQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<ChangeTaskStatusResponse>> ChangeStatus([FromServices] ISender sender,
        [FromBody] ChangeTaskStatusCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetTasksQueryResponse>> GetTaskQuery([FromServices] ISender sender,
        [FromBody] GetTasksQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<ProjectTaskDto>> GetTask(ISender sender, Guid id)
    {
        //TODO Add authorization checks (level my created & assigned)
        GetTaskQuery query = new GetTaskQuery() { Id = id };
        return await sender.Send(query);
    }

    private async Task<Result<DeleteTaskResponse>> DeleteTask([FromServices] ISender sender, Guid id)
    {
        //TODO Add authorization checks (my created )
        var command = new DeleteTaskCommand() { Id = id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateTaskResponse>> UpdateTask([FromServices] ISender sender,
        [FromBody] UpdateTaskCommand command)
    {
        //TODO Test
        //TODO Add authorization checks (my created)
        return await sender.Send(command);
    }

    private async Task<Result<CreateTaskResponse>> CreateTask([FromServices] ISender sender,
        [FromBody] CreateTaskCommand command)
    {
        //TODO Add authorization checks (members level, no assign task permission )
        return await sender.Send(command);
    }

    private async Task<Result<TranscribeTaskResponse>> TranscribeTask([FromServices] ISender sender,
        [FromBody] TranscribeTaskCommand command)
    {
        return await sender.Send(command);
    }
}
