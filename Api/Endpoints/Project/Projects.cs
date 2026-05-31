using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Project.Projects.Commands.AddProject;
using Novologs.Application.Modules.Project.Projects.Commands.DeleteProject;
using Novologs.Application.Modules.Project.Projects.Commands.UpdateProject;
using Novologs.Application.Modules.Project.Projects.Queries.GetProject;
using Novologs.Application.Modules.Project.Projects.Queries.GetProjectStatistics;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class Projects : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        //TODO Add authorization
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getProjects", GetProjects);
        manageGroup.MapPost("/addProject", AddProject);
        manageGroup.MapDelete("/deleteProject/{id}", DeleteProject);
        manageGroup.MapPut("/updateProject", UpdateProject);
        manageGroup.MapGet("/getProjectStatistics/{id}", GetProjectStatistics);
    }

    private async Task<Result<GetProjectStatisticsResponse>> GetProjectStatistics([FromServices] ISender sender,
        Guid id)
    {
        var query = new GetProjectStatisticsQuery() { ProjectId = id };
        return await sender.Send(query);
    }

    private async Task<Result<AddProjectResponse>> AddProject([FromBody] AddProjectCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetProjectResponse>> GetProjects([FromBody] GetProjectQuery query,
        [FromServices] ISender sender)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteProjectResponse>> DeleteProject([FromServices] ISender sender, Guid Id)
    {
        var command = new DeleteProjectCommand() { Id = Id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateProjectResponse>> UpdateProject([FromBody] UpdateProjectCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }
}
