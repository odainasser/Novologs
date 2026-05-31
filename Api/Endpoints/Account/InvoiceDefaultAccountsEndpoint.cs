using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Commands.CreateInvoiceDefaultAccount;
using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Commands.DeleteInvoiceDefaultAccount;
using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Commands.UpdateInvoiceDefaultAccount;
using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Queries.GetInvoiceDefaultAccount;
using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Queries.GetInvoiceDefaultAccounts;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class InvoiceDefaultAccountsEndpoint : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/invoice-default-accounts")
            .RequireAuthorization()
            .WithTags("Invoice Default Accounts")
            .WithOpenApi();

        group.MapPost("/", CreateInvoiceDefaultAccount)
            .WithName("CreateInvoiceDefaultAccount")
            .WithDescription("Create a default GL account mapping for Purchase or Sales invoices. Only one entry per invoice category is allowed.");

        group.MapPost("/list", GetInvoiceDefaultAccounts)
            .WithName("GetInvoiceDefaultAccounts")
            .WithDescription("Get a paginated, sortable, and searchable list of invoice default account mappings.");

        group.MapGet("/{id:guid}", GetInvoiceDefaultAccount)
            .WithName("GetInvoiceDefaultAccount")
            .WithDescription("Get a single invoice default account mapping by ID.");

        group.MapPut("/{id:guid}", UpdateInvoiceDefaultAccount)
            .WithName("UpdateInvoiceDefaultAccount")
            .WithDescription("Update the debit/credit accounts for an existing invoice default account mapping.");

        group.MapDelete("/{id:guid}", DeleteInvoiceDefaultAccount)
            .WithName("DeleteInvoiceDefaultAccount")
            .WithDescription("Delete an invoice default account mapping.");
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

    private async Task<IResult> CreateInvoiceDefaultAccount(
        [FromServices] ISender sender,
        [FromBody] CreateInvoiceDefaultAccountCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        return Results.Ok(result);
    }

    private async Task<IResult> GetInvoiceDefaultAccounts(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetInvoiceDefaultAccountsQuery? query)
    {
        var result = await sender.Send(query ?? new GetInvoiceDefaultAccountsQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetInvoiceDefaultAccount(
        [FromServices] ISender sender,
        Guid id)
    {
        var result = await sender.Send(new GetInvoiceDefaultAccountQuery(id));
        return ToResult(result);
    }

    private async Task<IResult> UpdateInvoiceDefaultAccount(
        [FromServices] ISender sender,
        Guid id,
        [FromBody] UpdateInvoiceDefaultAccountCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return ToResult(result);
    }

    private async Task<IResult> DeleteInvoiceDefaultAccount(
        [FromServices] ISender sender,
        Guid id)
    {
        var result = await sender.Send(new DeleteInvoiceDefaultAccountCommand(id));
        return ToResult(result);
    }
}
