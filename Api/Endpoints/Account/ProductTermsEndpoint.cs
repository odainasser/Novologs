using Novologs.Application.Modules.Account.Products.Commands.CreateProductTerm;
using Novologs.Application.Modules.Account.Products.Commands.DeleteProductTerm;
using Novologs.Application.Modules.Account.Products.Commands.UpdateProductTerm;
using Novologs.Application.Modules.Account.Products.Queries.GetProductTermLookups;
using Novologs.Application.Modules.Account.Products.Queries.GetProductTerms;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class ProductTermsEndpoint : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/products/terms")
            .RequireAuthorization()
            .WithTags("Product Terms")
            .WithOpenApi();

        group.MapPost("/", CreateProductTerm)
            .WithName("CreateProductTerm")
            .WithDescription("Create a new product term.");

        group.MapPost("/list", GetProductTerms)
            .WithName("GetProductTerms")
            .WithDescription("Get a paginated list of product terms.");

        group.MapGet("/lookups", GetProductTermLookups)
            .WithName("GetProductTermLookups")
            .WithDescription("Get all product terms as a lookup list for dropdowns.");

        group.MapPut("/{id:guid}", UpdateProductTerm)
            .WithName("UpdateProductTerm")
            .WithDescription("Update an existing product term.");

        group.MapDelete("/{id:guid}", DeleteProductTerm)
            .WithName("DeleteProductTerm")
            .WithDescription("Soft-delete a product term.");
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

    private async Task<IResult> CreateProductTerm(
        [FromServices] ISender sender,
        [FromBody] CreateProductTermCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        return Results.Created($"/api/products/terms/{result.SuccessStatus!.Id}", result);
    }

    private async Task<IResult> GetProductTerms(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetProductTermsQuery? query)
    {
        var result = await sender.Send(query ?? new GetProductTermsQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetProductTermLookups([FromServices] ISender sender)
    {
        var result = await sender.Send(new GetProductTermLookupsQuery());
        return ToResult(result);
    }

    private async Task<IResult> UpdateProductTerm(
        [FromServices] ISender sender,
        Guid id,
        [FromBody] UpdateProductTermCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return ToResult(result);
    }

    private async Task<IResult> DeleteProductTerm(
        [FromServices] ISender sender,
        Guid id)
    {
        var result = await sender.Send(new DeleteProductTermCommand(id));
        return ToResult(result);
    }
}
