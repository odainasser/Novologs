using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;
using Novologs.Application.Modules.Vendor.Vendors.Commands.AddVendor;
using Novologs.Application.Modules.Vendor.Vendors.Commands.DeleteVendor;
using Novologs.Application.Modules.Vendor.Vendors.Commands.UpdateVendor;
using Novologs.Application.Modules.Vendor.Vendors.Queries.GetVendor;

namespace Novologs.Api.Endpoints.Vendor;

public class Vendors : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Vendor").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getVendor", GetVendor);
        manageGroup.MapPost("/addVendor", AddVendor);
        manageGroup.MapPut("/updateVendor", UpdateVendor);
        manageGroup.MapDelete("/deleteVendor/{id:guid}", DeleteVendor);
    }

    public async Task<Result<GetVendorResponse>> GetVendor(ISender sender, [FromBody] GetVendorQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<AddVendorResponse>> AddVendor(ISender sender, [FromBody] AddVendorCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<UpdateVendorResponse>> UpdateVendor(ISender sender, [FromBody] UpdateVendorCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteVendorResponse>> DeleteVendor(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteVendorCommand { Id = id });
    }
}
