using Novologs.Application.CompanyBranches.Commands.AddCompanyBranch;
using Novologs.Application.CompanyBranches.Commands.DeleteCompanyBranch;
using Novologs.Application.CompanyBranches.Commands.UpdateCompanyBranch;
using Novologs.Application.CompanyBranches.Queries.GetCompanyBranch;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;

namespace Novologs.Api.Endpoints.Tenant;

public class CompanyBranch : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getCompanyBranches", GetCompanyBranches);
        manageGroup.MapPost("/addCompanyBranch", AddCompanyBranch);
        manageGroup.MapPut("/updateCompanyBranch", UpdateCompanyBranch);
        manageGroup.MapDelete("/deleteCompanyBranch", DeleteCompanyBranch);
    }

    private async Task<Result<GetCompanyBranchesQueryResponse>> GetCompanyBranches([FromServices] ISender sender,
        [FromBody] GetCompanyBranchesQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddCompanyBranchResponse>> AddCompanyBranch([FromServices] ISender sender,
        [FromBody] AddCompanyBranchCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateCompanyBranchResponse>> UpdateCompanyBranch([FromServices] ISender sender,
        [FromBody] UpdateCompanyBranchCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteCompanyBranchResponse>> DeleteCompanyBranch([FromServices] ISender sender,
        [FromBody] DeleteCompanyBranchCommand command)
    {
        return await sender.Send(command);
    }
}
