using Novologs.Application.Modules.Account.Products.Commands.CreateProduct;
using Novologs.Application.Modules.Account.Products.Commands.DeleteProduct;
using Novologs.Application.Modules.Account.Products.Commands.UpdateProduct;
using Novologs.Application.Modules.Account.Products.Queries.GetProductLookups;
using Novologs.Application.Modules.Account.Products.Queries.GetProducts;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class ProductsEndpoint : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/products")
            .RequireAuthorization()
            .WithTags("Products")
            .WithOpenApi();

        group.MapPost("/", CreateProduct)
            .WithName("CreateProduct")
            .WithDescription("Create a new product.");

        group.MapPost("/list", GetProducts)
            .WithName("GetProducts")
            .WithDescription("Get a paginated list of products.");

        group.MapGet("/lookups", GetProductLookups)
            .WithName("GetProductLookups")
            .WithDescription("Get all active products as a lookup list for dropdowns.");

        group.MapPut("/{id:int}", UpdateProduct)
            .WithName("UpdateProduct")
            .WithDescription("Update an existing product.");

        group.MapDelete("/{id:int}", DeleteProduct)
            .WithName("DeleteProduct")
            .WithDescription("Soft-delete a product. Fails if the product is referenced in any purchase order.");
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

    private async Task<IResult> CreateProduct(
        [FromServices] ISender sender,
        [FromBody] CreateProductCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        return Results.Created($"/api/products/{result.SuccessStatus!.Id}", result);
    }

    private async Task<IResult> GetProducts(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetProductsQuery? query)
    {
        var result = await sender.Send(query ?? new GetProductsQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetProductLookups([FromServices] ISender sender)
    {
        var result = await sender.Send(new GetProductLookupsQuery());
        return ToResult(result);
    }

    private async Task<IResult> UpdateProduct(
        [FromServices] ISender sender,
        int id,
        [FromBody] UpdateProductCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return ToResult(result);
    }

    private async Task<IResult> DeleteProduct(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new DeleteProductCommand(id));
        return ToResult(result);
    }
}
