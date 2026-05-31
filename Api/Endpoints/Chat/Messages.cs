using Novologs.Application.Modules.Chat.ChatMessages.Commands.AddChatMessage;
using Novologs.Application.Modules.Chat.ChatMessages.Commands.ChangeDeliveryChatMessage;
using Novologs.Application.Modules.Chat.ChatMessages.Commands.DeleteChatMessage;
using Novologs.Application.Modules.Chat.ChatMessages.Commands.MarkRoomMessagesAsSeen;
using Novologs.Application.Modules.Chat.ChatMessages.Commands.RemoveReaction;
using Novologs.Application.Modules.Chat.ChatMessages.Commands.ToggleReaction;
using Novologs.Application.Modules.Chat.ChatMessages.Commands.TranscribeChatMessage;
using Novologs.Application.Modules.Chat.ChatMessages.Commands.UpdateChatMessage;
using Novologs.Application.Modules.Chat.ChatMessages.Queries.GetChatMessage;
using Novologs.Application.Modules.Chat.ChatMessages.Queries.GetMention;
using Microsoft.AspNetCore.Mvc;
using Novologs.Domain.Enums;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class Messages : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Messages").RequireAuthorization().WithOpenApi();
        manageGroup.MapPost("/getChatMessage", GetChatMessage);
        manageGroup.MapPost("/addChatMessage", AddChatMessage);
        manageGroup.MapPut("/updateChatMessage", UpdateChatMessage);
        manageGroup.MapDelete("/deleteChatMessage/{id:guid}/{status}", DeleteChatMessage);
        manageGroup.MapPut("/changeDeliveryChatMessage", ChangeDeliveryChatMessage);
        manageGroup.MapPost("/markRoomMessagesAsSeen", MarkRoomMessagesAsSeen);
        manageGroup.MapPost("/toggleReaction", ToggleReaction);
        manageGroup.MapDelete("/removeReaction/{messageId:guid}", RemoveReaction);
        manageGroup.MapPost("/transcribe/{messageId:guid}", TranscribeChatMessage);
        manageGroup.MapPost("/getMentions", GetMentions);
    }

    public async Task<IResult> AddChatMessage([FromServices] ISender sender, AddChatMessageCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> UpdateChatMessage([FromServices] ISender sender,
        UpdateChatMessageCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> DeleteChatMessage([FromServices] ISender sender, Guid id, ChatMessageDeleteStatus status)
    {
        DeleteChatMessageCommand command = new() { Id = id, DeletedStatus = status };
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
    public async Task<IResult> GetMentions([FromServices] ISender sender, GetMentionQuery query)
    {
        var result = await sender.Send(query);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
    public async Task<IResult> GetChatMessage([FromServices] ISender sender, [FromBody] GetChatMessageQuery query)
    {
        var result = await sender.Send(query);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> ChangeDeliveryChatMessage([FromServices] ISender sender,
        ChangeDeliveryChatMessageCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> MarkRoomMessagesAsSeen([FromServices] ISender sender,
        MarkRoomMessagesAsSeenCommand command)
    {
       
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> ToggleReaction([FromServices] ISender sender,
        ToggleReactionCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> RemoveReaction([FromServices] ISender sender, Guid messageId)
    {
        RemoveReactionCommand command = new() { MessageId = messageId };
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<IResult> TranscribeChatMessage([FromServices] ISender sender, Guid messageId)
    {
        TranscribeChatMessageCommand command = new() { MessageId = messageId };
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
