using Novologs.Application.Modules.Document.CommentItems.Commands.AddCommentItem;
using Novologs.Application.Modules.Document.CommentItems.Commands.DeleteCommentItem;
using Novologs.Application.Modules.Document.CommentItems.Commands.UpdateCommentItem;
using Novologs.Application.Modules.Document.CommentItems.Queries.GetCommentItem;
using Novologs.Application.Modules.Document.CommentThreads.Commands.AddCommentThread;
using Novologs.Application.Modules.Document.CommentThreads.Commands.DeleteCommentThread;
using Novologs.Application.Modules.Document.CommentThreads.Queries.GetCommentThread;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Novologs.Api.Endpoints.Document;

public class Comments : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Thread").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getCommentThread", GetCommentThread);

        manageGroup = app.MapGroup("/Item").RequireAuthorization().WithOpenApi();
        manageGroup.MapPost("/getCommentItem", GetCommentItem);
        manageGroup.MapPost("/addCommentItem", AddCommentItem);
        manageGroup.MapPut("/updateCommentItem", UpdateCommentItem);
        manageGroup.MapDelete("/deleteCommentItem/{id:guid}", DeleteCommentItem);
    }

    public async Task<Result<GetCommentThreadResponse>> GetCommentThread(ISender sender,
        [FromBody] GetCommentThreadQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<AddCommentThreadResponse>> AddCommentThread(ISender sender,
        [FromBody] AddCommentThreadCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteCommentThreadResponse>> DeleteCommentThread(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteCommentThreadCommand { Id = id });
    }

    public async Task<Result<GetCommentItemResponse>> GetCommentItem(ISender sender,
        [FromBody] GetCommentItemQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<AddCommentItemResponse>> AddCommentItem(ISender sender,
        [FromBody] AddCommentItemCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<UpdateCommentItemResponse>> UpdateCommentItem(ISender sender,
        [FromBody] UpdateCommentItemCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteCommentItemResponse>> DeleteCommentItem(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteCommentItemCommand { Id = id });
    }
}
