using Microsoft.AspNetCore.Mvc;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

using Novologs.Application.Modules.Chat.ChatRooms.Commands.AddChatRoom;
using Novologs.Application.Modules.Chat.ChatRooms.Commands.DeleteChatRoom;
using Novologs.Application.Modules.Chat.ChatRooms.Commands.UpdateChatRoom;
using Novologs.Application.Modules.Chat.ChatRooms.Queries.GetChatRoom;
using Novologs.Api.Infrastructure;

public class Rooms : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Rooms").RequireAuthorization().WithOpenApi();
        manageGroup.MapPost("/getChatRoom", GetChatRoom);
        manageGroup.MapPost("/addChatRoom", AddChatRoom);
        manageGroup.MapPut("/updateChatRoom", UpdateChatRoom);
        manageGroup.MapDelete("/deleteChatRoom/{id:guid}", DeleteChatRoom);
    }

    public async Task<IResult> AddChatRoom([FromServices] ISender sender, AddChatRoomCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> UpdateChatRoom([FromServices] ISender sender, UpdateChatRoomCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> DeleteChatRoom([FromServices] ISender sender, Guid id)
    {
        DeleteChatRoomCommand command = new() { Id = id };
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> GetChatRoom([FromServices] ISender sender, [FromBody] GetChatRoomQuery query)
    {
        var result = await sender.Send(query);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
