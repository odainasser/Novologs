using Novologs.Application.Modules.Account.Products.Commands.CreateProductOrderType;
using Novologs.Application.Modules.Account.Products.Commands.DeleteProductOrderType;
using Novologs.Application.Modules.Account.Products.Commands.UpdateProductOrderType;
using Novologs.Application.Modules.Account.Products.Queries.GetProductOrderTypeLookups;
using Novologs.Application.Modules.Account.Products.Queries.GetProductOrderTypes;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class ProductOrderTypesEndpoint : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/products/order-types")
            .RequireAuthorization()
            .WithTags("Product Order Types")
            .WithOpenApi();

        group.MapPost("/", CreateProductOrderType)
            .WithName("CreateProductOrderType")
            .WithDescription("Create a new product order type.");

        group.MapPost("/list", GetProductOrderTypes)
            .WithName("GetProductOrderTypes")
            .WithDescription("Get a paginated list of product order types.");

        group.MapGet("/lookups", GetProductOrderTypeLookups)
            .WithName("GetProductOrderTypeLookups")
            .WithDescription("Get all product order types as a lookup list for dropdowns.");

        group.MapPut("/{id:guid}", UpdateProductOrderType)
            .WithName("UpdateProductOrderType")
            .WithDescription("Update an existing product order type.");

        group.MapDelete("/{id:guid}", DeleteProductOrderType)
            .WithName("DeleteProductOrderType")
            .WithDescription("Soft-delete a product order type.");
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

    private async Task<IResult> CreateProductOrderType(
        [FromServices] ISender sender,
        [FromBody] CreateProductOrderTypeCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        return Results.Created($"/api/products/order-types/{result.SuccessStatus!.Id}", result);
    }

    private async Task<IResult> GetProductOrderTypes(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetProductOrderTypesQuery? query)
    {
        var result = await sender.Send(query ?? new GetProductOrderTypesQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetProductOrderTypeLookups([FromServices] ISender sender)
    {
        var result = await sender.Send(new GetProductOrderTypeLookupsQuery());
        return ToResult(result);
    }

    private async Task<IResult> UpdateProductOrderType(
        [FromServices] ISender sender,
        Guid id,
        [FromBody] UpdateProductOrderTypeCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return ToResult(result);
    }

    private async Task<IResult> DeleteProductOrderType(
        [FromServices] ISender sender,
        Guid id)
    {
        var result = await sender.Send(new DeleteProductOrderTypeCommand(id));
        return ToResult(result);
    }
}
