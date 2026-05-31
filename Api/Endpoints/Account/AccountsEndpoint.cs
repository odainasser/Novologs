using Novologs.Application.Modules.Account.Accounts.Commands.CreateAccount;
using Novologs.Application.Modules.Account.Accounts.Commands.DeleteAccount;
using Novologs.Application.Modules.Account.Accounts.Commands.SetOpeningBalance;
using Novologs.Application.Modules.Account.Accounts.Commands.UpdateAccount;
using Novologs.Application.Modules.Account.Accounts.DTOs;
using Novologs.Application.Modules.Account.Accounts.Queries.GetAccount;
using Novologs.Application.Modules.Account.Accounts.Queries.GetAccounts;
using Novologs.Application.Modules.Account.Accounts.Queries.GetAccountsByLevel;
using Novologs.Application.Modules.Account.Accounts.Queries.GetAccountLookups;
using Novologs.Application.Modules.Account.Accounts.Queries.GetChartOfAccounts;
using Novologs.Application.Modules.Account.Accounts.Queries.GetChartOfAccountsList;
using Novologs.Application.Modules.Account.Transactions.Queries.GetAccountLedger;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class AccountsEndpoint : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var accountGroup = app.MapGroup("/accounts")
            .RequireAuthorization()
            .WithTags("Accounts")
            .WithOpenApi();

        accountGroup.MapPost("/", CreateAccount)
            .WithName("CreateAccount")
            .WithDescription("Create a new account");

        accountGroup.MapPut("/{id}", UpdateAccount)
            .WithName("UpdateAccount")
            .WithDescription("Update an existing account");

        accountGroup.MapDelete("/{id}", DeleteAccount)
            .WithName("DeleteAccount")
            .WithDescription("Delete an account");

        accountGroup.MapGet("/{id}", GetAccount)
            .WithName("GetAccount")
            .WithDescription("Get account by ID");

        accountGroup.MapGet("/", GetAccounts)
            .WithName("GetAccounts")
            .WithDescription("Get list of accounts with optional filtering");

        accountGroup.MapGet("/chart", GetChartOfAccounts)
            .WithName("GetChartOfAccounts")
            .WithDescription("Get hierarchical chart of accounts");

        accountGroup.MapPost("/chart/list", GetChartOfAccountsList)
            .WithName("GetChartOfAccountsList")
            .WithDescription("Get a paginated and sortable flat list of chart of accounts with all associated categories");

        accountGroup.MapGet("/lookups", GetAccountLookups)
            .WithName("GetAccountLookups")
            .WithDescription("Get a lightweight list of all active leaf accounts (Code + Name) for use in dropdowns and references");

        accountGroup.MapGet("/root", GetRootAccounts)
            .WithName("GetRootAccounts")
            .WithDescription("Get level 1 accounts (Assets, Liabilities, Equity, Revenue, Expense)");

        accountGroup.MapGet("/level/{level}", GetAccountsByLevel)
            .WithName("GetAccountsByLevel")
            .WithDescription("Get accounts at a specific level with optional parent filter");

        accountGroup.MapGet("/{id}/children", GetAccountChildren)
            .WithName("GetAccountChildren")
            .WithDescription("Get direct children of an account");

        accountGroup.MapGet("/{id}/ledger", GetAccountLedger)
            .WithName("GetAccountLedger")
            .WithDescription("Get account ledger with opening balance, transactions, and running balance");

        accountGroup.MapPost("/opening-balance", SetOpeningBalance)
            .WithName("SetOpeningBalance")
            .WithDescription("Set or update opening balances for multiple accounts (must tally: total debits = total credits)");
    }

    private async Task<IResult> CreateAccount(
        [FromServices] ISender sender,
        [FromBody] CreateAccountCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            var code = result.Errors.FirstOrDefault()?.Code ?? string.Empty;
            return code.Contains("_404_") ? Results.NotFound(result.Errors) : Results.BadRequest(result.Errors);
        }
        return Results.Created($"/api/accounts/{result.SuccessStatus?.Id}", result);
    }

    private async Task<Result<bool>> UpdateAccount(
        [FromServices] ISender sender,
        Guid id,
        [FromBody] UpdateAccountDto dto)
    {
        var command = new UpdateAccountCommand
        {
            Id = id,
            Name = dto.Name,
            AccountType = dto.AccountType,
            AccountCategory = dto.AccountCategory,
            ParentAccountId = dto.ParentAccountId,
            IsActive = dto.IsActive
        };

        return await sender.Send(command);
    }

    private async Task<Result<bool>> DeleteAccount(
        [FromServices] ISender sender,
        Guid id)
    {
        var command = new DeleteAccountCommand { Id = id };
        return await sender.Send(command);
    }

    private async Task<Result<AccountDto>> GetAccount(
        [FromServices] ISender sender,
        Guid id)
    {
        var query = new GetAccountQuery { Id = id };
        return await sender.Send(query);
    }

    private async Task<Result<List<AccountDto>>> GetAccounts(
        [FromServices] ISender sender,
        [FromQuery] int? accountType,
        [FromQuery] int? accountCategory,
        [FromQuery] bool? isActive)
    {
        var query = new GetAccountsQuery
        {
            AccountType = accountType.HasValue ? (Novologs.Domain.Enums.AccountType)accountType.Value : null,
            AccountCategory = accountCategory.HasValue ? (Novologs.Domain.Enums.AccountCategory)accountCategory.Value : null,
            IsActive = isActive
        };

        return await sender.Send(query);
    }

    private async Task<Result<List<ChartOfAccountsDto>>> GetChartOfAccounts(
        [FromServices] ISender sender)
    {
        var query = new GetChartOfAccountsQuery();
        return await sender.Send(query);
    }

    private async Task<IResult> GetChartOfAccountsList(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetChartOfAccountsListQuery? query)
    {
        var result = await sender.Send(query ?? new GetChartOfAccountsListQuery());
        if (!result.Succeeded)
        {
            var code = result.Errors.FirstOrDefault()?.Code ?? string.Empty;
            return code.Contains("_404_") ? Results.NotFound(result.Errors) : Results.BadRequest(result.Errors);
        }
        return Results.Ok(result);
    }

    private async Task<Result<List<AccountDto>>> GetRootAccounts(
        [FromServices] ISender sender)
    {
        var query = new GetAccountsByLevelQuery { Level = 1 };
        return await sender.Send(query);
    }

    private async Task<Result<List<AccountDto>>> GetAccountsByLevel(
        [FromServices] ISender sender,
        int level,
        [FromQuery] Guid? parentId,
        [FromQuery] bool? isActive)
    {
        var query = new GetAccountsByLevelQuery
        {
            Level = level,
            ParentAccountId = parentId,
            IsActive = isActive
        };
        return await sender.Send(query);
    }

    private async Task<Result<List<AccountDto>>> GetAccountChildren(
        [FromServices] ISender sender,
        Guid id,
        [FromQuery] bool? isActive)
    {
        var query = new GetAccountsQuery
        {
            IsActive = isActive
        };
        
        var allAccountsResult = await sender.Send(query);
        
        if (!allAccountsResult.Succeeded || allAccountsResult.SuccessStatus == null)
        {
            return allAccountsResult.Succeeded 
                ? Result<List<AccountDto>>.Success(new List<AccountDto>())
                : allAccountsResult;
        }
        
        var children = allAccountsResult.SuccessStatus
            .Where(a => a.ParentAccountId == id)
            .ToList();
        
        return Result<List<AccountDto>>.Success(children);
    }

    private async Task<Result<List<AccountLookupDto>>> GetAccountLookups(
        [FromServices] ISender sender)
    {
        var query = new GetAccountLookupsQuery();
        return await sender.Send(query);
    }

    private async Task<Result<bool>> SetOpeningBalance(
        [FromServices] ISender sender,
        [FromBody] SetOpeningBalanceCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<IResult> GetAccountLedger(
        [FromServices] ISender sender,
        Guid id,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var fromDate = from ?? DateTime.UtcNow.Date.AddMonths(-1);
        var toDate   = to   ?? DateTime.UtcNow.Date;

        var result = await sender.Send(new GetAccountLedgerQuery
        {
            AccountId = id,
            From      = fromDate,
            To        = toDate
        });

        if (!result.Succeeded)
        {
            var code = result.Errors.FirstOrDefault()?.Code ?? string.Empty;
            return code.Contains("_404_") ? Results.NotFound(result.Errors) : Results.BadRequest(result.Errors);
        }

        return Results.Ok(result);
    }
}
