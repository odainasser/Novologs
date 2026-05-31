using Novologs.Application.Departments.Commands.AddDepartment; 
using Novologs.Application.Departments.Commands.DeleteDepartment;
using Novologs.Application.Departments.Queries.GetDepartment;
using Novologs.Application.Departments.Commands.UpdateDepartment;

namespace Novologs.Api.Endpoints.Tenant;

using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models; 

public class Department : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getDepartment", GetDepartment);
        manageGroup.MapPost("/addDepartment", AddDepartment);
        manageGroup.MapPut("/updateDepartment", UpdateDepartment);
        manageGroup.MapDelete("/deleteDepartment", DeleteDepartment);
    }

    private async Task<Result<GetDepartmentResponse>> GetDepartment([FromServices] ISender sender,
        [FromBody] GetDepartmentQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddDepartmentResponse>> AddDepartment([FromServices] ISender sender,
        [FromBody] AddDepartmentCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateDepartmentResponse>> UpdateDepartment([FromServices] ISender sender,
        [FromBody] UpdateDepartmentCommand command)
    {
        return await sender.Send(command);
    }
    private async Task<Result<DeleteDepartmentResponse>> DeleteDepartment([FromServices] ISender sender, [FromBody] DeleteDepartmentCommand command)
    {
        return await sender.Send(command);
    }
} 
