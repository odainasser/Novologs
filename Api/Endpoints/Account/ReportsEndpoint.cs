using Novologs.Application.Modules.Account.Transactions.Queries.GetTrialBalance;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class ReportsEndpoint : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/reports")
            .RequireAuthorization()
            .WithTags("Reports")
            .WithOpenApi();

        group.MapGet("/trial-balance", GetTrialBalance)
            .WithName("GetTrialBalance")
            .WithDescription("Trial balance showing total debits and credits per account up to a given date");
    }

    private async Task<IResult> GetTrialBalance(
        [FromServices] ISender sender,
        [FromQuery] DateTime? asOf)
    {
        var date = asOf ?? DateTime.UtcNow.Date;
        var result = await sender.Send(new GetTrialBalanceQuery { AsOf = date });

        return result.Succeeded
            ? Results.Ok(result)
            : Results.BadRequest(result.Errors);
    }
}
