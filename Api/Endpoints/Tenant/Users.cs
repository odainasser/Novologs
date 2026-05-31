using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.User.Commands.ActivateDeactivateUser;
using Novologs.Application.User.Commands.AddUser;
using Novologs.Application.User.Commands.ChangePassword;
using Novologs.Application.User.Commands.ConfirmEmail;
using Novologs.Application.User.Commands.ConfirmEmailSetPassword;
using Novologs.Application.User.Commands.DeleteUser;
using Novologs.Application.User.Commands.ForgetPassword;
using Novologs.Application.User.Commands.ResendActivationEmail;
using Novologs.Application.User.Commands.GetRolesUser;
using Novologs.Application.User.Commands.Login;
using Novologs.Application.User.Commands.Refresh;
using Novologs.Application.User.Commands.ResetPassword;
using Novologs.Application.User.Commands.UpdateUser;
using Novologs.Application.User.Commands.UpdateUserInfo;
using Novologs.Application.User.Dto;
using Novologs.Application.User.Queries.GetUser;
using Novologs.Application.User.Queries.GetUsers;

namespace Novologs.Api.Endpoints.Tenant;

public class Users : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/Users").WithTags("User Login").WithOpenApi();

        group.MapPost("/forgotPassword", ForgetPassword);
        group.MapPost("/resetPassword", ResetPassword);

        group.MapPost("/login", Login);
        group.MapGet("/confirmEmail", ConfirmEmail);
        group.MapPost("/confirmEmailSetPassword", ConfirmEmailSetPassword);
        group.MapPost("/changePassword", ChangePassword).RequireAuthorization();

        group.MapPost("/refresh", Refresh).AllowAnonymous();
        var manageGroup = app.MapGroup("/Users/manage").WithTags("User Manage").RequireAuthorization();
        manageGroup.MapGet("/info", GetInfo);
        manageGroup.MapPost("/info", UpdateInfo);
        manageGroup.MapGet("/getRoles", getRoles);
        manageGroup.MapPost("/getUser", GetUserList);
        manageGroup.MapGet("/GetUser/{id}", GetUser);
        manageGroup.MapGet("/getAllRoles", getAllRoles);

        var restrictedGroup = app.MapGroup("/Users/settings").WithTags("User Settings");
        restrictedGroup.MapPost("/addUser", AddUser);
        restrictedGroup.MapPost("/updateUser", UpdateUser);
        restrictedGroup.MapPost("/deleteUser", DeleteUser);
        restrictedGroup.MapPost("/activateDeactivateUser", ActivateDeactivateUser);
        restrictedGroup.MapPost("/resendActivationEmail", ResendActivationEmail);
    }

    async Task<Result<ActivateDeactivateUserResponse>> ActivateDeactivateUser(
        [FromServices] ISender sender,
        [FromBody] ActivateDeactivateUserCommand command)
    {
        return await sender.Send(command);
    }

    async Task<Result<ResendActivationEmailResponse>> ResendActivationEmail(
        [FromServices] ISender sender,
        [FromBody] ResendActivationEmailCommand command)
    {
        return await sender.Send(command);
    }

    async Task<IResult> ResetPassword(
        [FromBody] ResetPasswordCommand command,
        [FromServices] ISender sender)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return TypedResults.Ok();
    }

    async Task<IResult> ConfirmEmailSetPassword(
        [FromBody] ConfirmEmailSetPasswordCommand command,
        [FromServices] ISender sender)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return TypedResults.Ok();
    }


    private Task<Result<GetRolesUserResponse>> getRoles([FromServices] ISender sender)
    {
        var command = new GetRolesUserCommand();
        return sender.Send(command);
    }

    private Task<Result<GetAllRolesUserResponse>> getAllRoles([FromServices] ISender sender)
    {
        var command = new GetAllRolesUserCommand();
        return sender.Send(command);
    }


    private async Task<Result<UpdateUserResponse>> UpdateUser([FromServices] ISender sender,
        [FromBody] UpdateUserCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteUserResponse>> DeleteUser([FromServices] ISender sender,
        [FromBody] DeleteUserCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetUsersQueryResponse>> GetUserList([FromServices] ISender sender,
        [FromBody] GetUsersQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<TenantUserDto>> GetUser([FromServices] ISender sender, Guid id)
    {
        var query = new GetUserQuery() { Id = id };
        var res = await sender.Send(query);

        return res;
    }

    private async Task<Result<AddUserResponse>> AddUser([FromServices] ISender sender,
        [FromBody] AddUserCommand command)
    {
        //TODO check Users Quota 
        return await sender.Send(command);
    }

    async Task<IResult> ConfirmEmail(
        [FromQuery] string userId,
        [FromQuery] string code,
        [FromServices] ISender sender)
    {
        var command = new ConfirmEmailCommand() { UserId = userId, Code = code };
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return TypedResults.Ok();
    }

    async Task<IResult> ForgetPassword(
        [FromBody] ForgetPasswordCommand command,
        [FromServices] ISender sender)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }

        return TypedResults.Ok(result);
    }

    async Task<IResult> ChangePassword(
        [FromBody] ChangePasswordCommand request,
        [FromServices] ISender sender)
    {
        var result = await sender.Send(request);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return TypedResults.Ok(result);
    }

    async Task<IResult> GetInfo(
        [FromServices] ISender sender)
    {
        try
        {
            var query = new Application.User.Queries.GetUserInfo.GetUserInfoQuery();
            var res = await sender.Send(query);

            if (res.Succeeded)
            {
                return Results.Ok(res);
            }
            else
            {
                return Results.BadRequest(res.Errors);
            }
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    async Task<IResult> UpdateInfo(
        [FromBody] UpdateUserInfoCommand request,
        [FromServices] ISender sender)
    {
        var result = await sender.Send(request);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return TypedResults.Ok(result);
    }

    async Task<Result> Login(
        [FromBody] LoginCommand loginRequest,
        [FromServices] ISender sender)
    {
        var result = await sender.Send(loginRequest);
        if (!result.Succeeded)
        {
            return Result.Failure(result.Errors);
        }

        return Result<LoginResponse>.Success(result.SuccessStatus!);
    }


    async Task<IResult> Refresh(
        [FromBody] RefreshCommand loginRequest,
        [FromServices] ISender sender)
    {
        var result = await sender.Send(loginRequest);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return Results.Ok(result.SuccessStatus);
    }

    public record RefreshLoginRequest(string RefreshToken);
}
