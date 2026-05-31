using Novologs.Application.Modules.Account.Products.Commands.CreateProductUnit;
using Novologs.Application.Modules.Account.Products.Commands.DeleteProductUnit;
using Novologs.Application.Modules.Account.Products.Commands.UpdateProductUnit;
using Novologs.Application.Modules.Account.Products.Queries.GetProductUnitLookups;
using Novologs.Application.Modules.Account.Products.Queries.GetProductUnits;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class ProductUnitsEndpoint : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/products/units")
            .RequireAuthorization()
            .WithTags("Product Units")
            .WithOpenApi();

        group.MapPost("/", CreateProductUnit)
            .WithName("CreateProductUnit")
            .WithDescription("Create a new product unit.");

        group.MapPost("/list", GetProductUnits)
            .WithName("GetProductUnits")
            .WithDescription("Get a paginated list of product units.");

        group.MapGet("/lookups", GetProductUnitLookups)
            .WithName("GetProductUnitLookups")
            .WithDescription("Get all product units as a lookup list for dropdowns.");

        group.MapPut("/{id:guid}", UpdateProductUnit)
            .WithName("UpdateProductUnit")
            .WithDescription("Update an existing product unit.");

        group.MapDelete("/{id:guid}", DeleteProductUnit)
            .WithName("DeleteProductUnit")
            .WithDescription("Soft-delete a product unit.");
    }

    private static IResult ToResult<T>(Result<T> result)
    {
        if (result.Succeeded)
            return Results.Ok(result);

        var code = result.Errors.FirstOrDefault()?.Code ?? string.Empty;

        if (code.Contains("_404_"))
            return Results.NotFound(result.Errors);

        if (code.Contains("_409_"))
            return Results.Conflict(result.Errors);

        return Results.BadRequest(result.Errors);
    }

    private async Task<IResult> CreateProductUnit(
        [FromServices] ISender sender,
        [FromBody] CreateProductUnitCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        return Results.Created($"/api/products/units/{result.SuccessStatus!.Id}", result);
    }

    private async Task<IResult> GetProductUnits(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetProductUnitsQuery? query)
    {
        var result = await sender.Send(query ?? new GetProductUnitsQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetProductUnitLookups([FromServices] ISender sender)
    {
        var result = await sender.Send(new GetProductUnitLookupsQuery());
        return ToResult(result);
    }

    private async Task<IResult> UpdateProductUnit(
        [FromServices] ISender sender,
        Guid id,
        [FromBody] UpdateProductUnitCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return ToResult(result);
    }

    private async Task<IResult> DeleteProductUnit(
        [FromServices] ISender sender,
        Guid id)
    {
        var result = await sender.Send(new DeleteProductUnitCommand(id));
        return ToResult(result);
    }
}
