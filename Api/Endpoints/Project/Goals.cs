namespace Microsoft.Extensions.DependencyInjection.Endpoints;

using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Project.Goals.Commands.AddGoal;
using Novologs.Application.Modules.Project.Goals.Commands.DeleteGoal;
using Novologs.Application.Modules.Project.Goals.Commands.UpdateGoal;
using Novologs.Application.Modules.Project.Goals.Queries.GetGoal;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

public class Goals : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        //TODO Add authorization
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getGoals", GetGoals);
        manageGroup.MapPost("/addGoal", AddGoal);
        manageGroup.MapDelete("/deleteGoal/{id}", DeleteGoal);
        manageGroup.MapPut("/updateGoal", UpdateGoal);
    }

    private async Task<Result<AddGoalResponse>> AddGoal([FromBody] AddGoalCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetGoalResponse>> GetGoals([FromBody] GetGoalQuery query, [FromServices] ISender sender)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteGoalResponse>> DeleteGoal([FromServices] ISender sender, Guid Id)
    {
        var command = new DeleteGoalCommand() { Id = Id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateGoalResponse>> UpdateGoal([FromBody] UpdateGoalCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }
}
