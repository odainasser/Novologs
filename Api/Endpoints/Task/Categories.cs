using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.Modules.Tasks.Categories.Commands.AddCategory;
using Novologs.Application.Modules.Tasks.Categories.Commands.DeleteCategory;
using Novologs.Application.Modules.Tasks.Categories.Commands.UpdateCategory;
using Novologs.Application.Modules.Tasks.Categories.Queries.GetCategory;
using Novologs.Application.Modules.Tasks.Categories.Queries.GetProjectCategory;
using Novologs.Api.Infrastructure;

namespace Novologs.Api.Endpoints.Task;

public class Categories : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Category").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/addCategory", AddCategory);
        manageGroup.MapPut("/updateCategory", UpdateCategory);
        manageGroup.MapDelete("/deleteCategory/{id}", DeleteCategory);
        manageGroup.MapPost("/getCategory", GetCategory);
        manageGroup.MapPost("/getProjectCategory", GetProjectCategory);
    }

    private async Task<Result<GetProjectCategoryResponse>> GetProjectCategory([FromServices] ISender sender,
        [FromBody] GetProjectCategoryQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<GetCategoryResponse>> GetCategory([FromServices] ISender sender,
        [FromBody] GetCategoryQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteCategoryResponse>> DeleteCategory([FromServices] ISender sender, Guid id)
    {
        //TODO Add authorization checks (my created )
        var command = new DeleteCategoryCommand() { Id = id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateCategoryResponse>> UpdateCategory([FromServices] ISender sender,
        [FromBody] UpdateCategoryCommand command)
    {
        //TODO Test
        //TODO Add authorization checks (my created)
        return await sender.Send(command);
    }

    private async Task<Result<AddCategoryResponse>> AddCategory([FromServices] ISender sender,
        [FromBody] AddCategoryCommand command)
    {
        //TODO Add authorization checks (members level, no assign task permission )
        return await sender.Send(command);
    }
}
