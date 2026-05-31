using Novologs.Application.UserGroups.Commands.AddUserGroup;
using Novologs.Application.UserGroups.Commands.DeleteUserGroup;
using Novologs.Application.UserGroups.Commands.UpdateUserGroup;
using Novologs.Application.UserGroups.Queries.GetUserGroup;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;

namespace Novologs.Api.Endpoints.Tenant; 

public class UserGroupEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/userGroups").RequireAuthorization().WithOpenApi();
        group.MapPost("/getUserGroups", GetUserGroups);
        group.MapPost("/addUserGroup", AddUserGroup);
        group.MapPut("/updateUserGroup", UpdateUserGroup);
        group.MapDelete("/deleteUserGroup/{id}", DeleteUserGroup);
    }

    private async Task<Result<GetUserGroupResponse>> GetUserGroups(ISender sender, [FromBody] GetUserGroupQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddUserGroupResponse>> AddUserGroup(ISender sender, [FromBody] AddUserGroupCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateUserGroupResponse>> UpdateUserGroup(ISender sender,
        [FromBody] UpdateUserGroupCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteUserGroupResponse>> DeleteUserGroup(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteUserGroupCommand { Id = id });
    }
}

