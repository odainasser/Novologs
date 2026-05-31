using Novologs.Application.Roles.Commands.AddRole;
using Novologs.Application.Roles.Commands.AssignPermissionToRole;
using Novologs.Application.Roles.Commands.BackfillInternalDashboardPermission;
using Novologs.Application.Roles.Commands.DeleteRole;
using Novologs.Application.Roles.Commands.UnassignPermissionToRole;
using Novologs.Application.Roles.Queries.GetPermissionList;
using Novologs.Application.Roles.Queries.GetRole;
using Novologs.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Roles.Commands.AddDescriptionToPermission;
using Novologs.Application.Roles.Commands.AssignPermissionToUser;
using Novologs.Application.Roles.Commands.UnassignPermissionToUser;
using Novologs.Application.Roles.Commands.UpdateRolePermission;
using Novologs.Application.Roles.Commands.UpdateUserPermission;
using Novologs.Application.Roles.Queries.GetUsersInRole;
using Novologs.Application.Roles.Queries.GetUsersWithPermission;

namespace Novologs.Api.Endpoints.Tenant;

public class Roles : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getRole", GetRole);
        manageGroup.MapPost("/getPermissionList", GetPermissionList);
        manageGroup.MapPost("/addRole", AddRole);
        manageGroup.MapPost("/assignPermissionToRole", AssignPermissionToRole);
        manageGroup.MapPost("/unassignPermissionToRole", UnassignPermissionToRole);
        manageGroup.MapDelete("/deleteRole", DeleteRole);
        manageGroup.MapPost("/assignPermissionToUser", AssignPermissionToUser);
        manageGroup.MapPost("/unassignPermissionToUser", UnassignPermissionToUser);
        manageGroup.MapPost("/getUsersInRole", GetUsersInRole);
        manageGroup.MapPost("/getUsersWithPermission", GetUsersWithPermission);
        manageGroup.MapPost("/addDescriptionToPermission", AddDescriptionToPermission);
        manageGroup.MapPost("/updateUserPermission", UpdateUserPermission);
        manageGroup.MapPost("/updateRolePermission", UpdateRolePermission);
        manageGroup.MapPost("/backfillInternalDashboardPermission", BackfillInternalDashboardPermission);
    }
    private async Task<Result<UpdateUserPermissionResponse>> UpdateUserPermission([FromServices] ISender sender,
        [FromBody] UpdateUserPermissionCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateRolePermissionResponse>> UpdateRolePermission([FromServices] ISender sender,
        [FromBody] UpdateRolePermissionCommand command)
    {
        return await sender.Send(command);
    }


    private async Task<Result<AddDescriptionToPermissionResponse>> AddDescriptionToPermission(
        [FromServices] ISender sender,
        [FromBody] AddDescriptionToPermissionCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetUsersInRoleResponse>> GetUsersInRole([FromServices] ISender sender,
        [FromBody] GetUsersInRoleQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<GetUsersWithPermissionResponse>> GetUsersWithPermission([FromServices] ISender sender,
        [FromBody] GetUsersWithPermissionQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AssignPermissionToUserResponse>> AssignPermissionToUser([FromServices] ISender sender,
        [FromBody] AssignPermissionToUserCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UnassignPermissionToUserResponse>> UnassignPermissionToUser([FromServices] ISender sender,
        [FromBody] UnassignPermissionToUserCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetRoleResponse>> GetRole([FromServices] ISender sender, [FromBody] GetRoleQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<GetPermissionListResponse>> GetPermissionList([FromServices] ISender sender,
        [FromBody] GetPermissionListQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddRoleResponse>> AddRole([FromServices] ISender sender,
        [FromBody] AddRoleCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<AssignPermissionToRoleResponse>> AssignPermissionToRole([FromServices] ISender sender,
        [FromBody] AssignPermissionToRoleCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UnassignPermissionToRoleResponse>> UnassignPermissionToRole([FromServices] ISender sender,
        [FromBody] UnassignPermissionToRoleCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteRoleResponse>> DeleteRole([FromServices] ISender sender,
        [FromBody] DeleteRoleCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<BackfillInternalDashboardPermissionResponse>> BackfillInternalDashboardPermission(
        [FromServices] ISender sender,
        [FromBody] BackfillInternalDashboardPermissionCommand command)
    {
        return await sender.Send(command);
    }
}
