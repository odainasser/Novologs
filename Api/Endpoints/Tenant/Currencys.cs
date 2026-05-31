using Novologs.Application.Currencys.Commands.AddCurrency;
using Novologs.Application.Currencys.Commands.DeleteCurrency;
using Novologs.Application.Currencys.Commands.UpdateCurrency;
using Novologs.Application.Currencys.Queries.GetCurrency;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;

namespace Novologs.Api.Endpoints.Tenant;

public class CurrencyEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/currencies").RequireAuthorization().WithOpenApi();
        group.MapPost("/getCurrencies", GetCurrencies);
        group.MapPost("/addCurrency", AddCurrency);
        group.MapPut("/updateCurrency", UpdateCurrency);
        group.MapDelete("/deleteCurrency/{id}", DeleteCurrency);
    }

    private async Task<Result<GetCurrencyResponse>> GetCurrencies(ISender sender, [FromBody] GetCurrencyQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddCurrencyResponse>> AddCurrency(ISender sender, [FromBody] AddCurrencyCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateCurrencyResponse>> UpdateCurrency(ISender sender,
        [FromBody] UpdateCurrencyCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteCurrencyResponse>> DeleteCurrency(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteCurrencyCommand { Id = id });
    }
}
