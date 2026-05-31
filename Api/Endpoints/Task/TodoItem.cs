using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.Modules.Tasks.TodoItems.Commands.AddTodoItem;
using Novologs.Application.Modules.Tasks.TodoItems.Commands.ChangeStatusTodoItem;
using Novologs.Application.Modules.Tasks.TodoItems.Commands.DeleteTodoItem;
using Novologs.Application.Modules.Tasks.TodoItems.Commands.UpdateTodoItem;
using Novologs.Application.Modules.Tasks.TodoItems.Queries.GetTodoItem;
using Novologs.Api.Infrastructure;

namespace Novologs.Api.Endpoints.Task;

public class TodoItems : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/TodoItem").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/addTodoItem", AddTodoItem);
        manageGroup.MapPut("/updateTodoItem", UpdateTodoItem);
        manageGroup.MapDelete("/deleteTodoItem/{id}", DeleteTodoItem);
        manageGroup.MapPost("/getTodoItem", GetTodoItem);
        manageGroup.MapPut("/changeStatus", ChangeStatus);
    }

    private async Task<Result<ChangeStatusTodoItemResponse>> ChangeStatus([FromServices] ISender sender,
        [FromBody] ChangeStatusTodoItemCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetTodoItemResponse>> GetTodoItem([FromServices] ISender sender,
        [FromBody] GetTodoItemQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteTodoItemResponse>> DeleteTodoItem([FromServices] ISender sender, Guid id)
    {
        var command = new DeleteTodoItemCommand() { Id = id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateTodoItemResponse>> UpdateTodoItem([FromServices] ISender sender,
        [FromBody] UpdateTodoItemCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<AddTodoItemResponse>> AddTodoItem([FromServices] ISender sender,
        [FromBody] AddTodoItemCommand command)
    {
        return await sender.Send(command);
    }
}
