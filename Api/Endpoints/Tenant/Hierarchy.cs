using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.Hierarchy.Commands.AddUserToHierarchy;
using Novologs.Application.Hierarchy.Commands.DeleteUserFromHierarchy;
using Novologs.Application.Hierarchy.Commands.SwapUserInHierarchy;
using Novologs.Application.Hierarchy.Queries.GetHierarchy;
using Novologs.Application.Hierarchy.Queries.GetMyEmployees;
using Novologs.Domain.Entities;

namespace Novologs.Api.Endpoints.Tenant;

public class Hierarchy : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getHierarchy", getHierarchy);
        manageGroup.MapPost("/addUserToHierarchy", addUserToHierarchy);
        manageGroup.MapPost("/swapUserInHierarchy", swapUserInHierarchy);
        manageGroup.MapDelete("/deleteUserFromHierarchy", deleteUserFromHierarchy);
        manageGroup.MapPost("/getMyEmployees", getMyEmployees);
    }

    private async Task<Result<GetMyEmployeesResponse>> getMyEmployees([FromServices] ISender sender,
        [FromBody] GetMyEmployeesQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<SwapUserInHierarchyResponse>> swapUserInHierarchy([FromServices] ISender sender,
        [FromBody] SwapUserInHierarchyCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteNodeFromHierarchyResponse>> deleteUserFromHierarchy([FromServices] ISender sender,
        [FromBody] DeleteNodeFromHierarchyCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<AddUserToHierarchyResponse>> addUserToHierarchy([FromServices] ISender sender,
        [FromBody] AddUserToHierarchyCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetHierarchyResponse>> getHierarchy([FromServices] ISender sender,
        [FromBody] GetHierarchyQuery query)
    {
        return await sender.Send(query);
    }
}
