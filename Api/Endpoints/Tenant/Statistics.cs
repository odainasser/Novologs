using Microsoft.AspNetCore.Mvc;
using Novologs.Application.UserStatistics.Queries.GetAdminStatistic;
using Novologs.Application.UserStatistics.Queries.GetUserStatistic;

namespace Novologs.Api.Endpoints.Tenant;

public class Statistics : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/Statistics").WithTags("Statistics").RequireAuthorization().WithOpenApi();

        group.MapGet("/UserStatistic", GetUserStatistic);
        group.MapGet("/AdminStatistic", GetAdminStatistic);
    }

    async Task<IResult> GetUserStatistic([FromServices] ISender sender, [FromQuery] Guid? userId)
    {
        var query = new GetUserStatisticQuery() { UserId = userId };
        var result = await sender.Send(query);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return Results.Ok(result);
    }
    async Task<IResult> GetAdminStatistic([FromServices] ISender sender, [FromQuery] Guid? userId)
    {
        var query = new GetAdminStatisticQuery() { UserId = userId };
        var result = await sender.Send(query);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return Results.Ok(result);
    }

}
