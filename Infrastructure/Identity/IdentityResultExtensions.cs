using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;

namespace Novologs.Infrastructure.Identity;

public static class IdentityResultExtensions
{
    public static Result ToApplicationResult(this IdentityResult result)
    {
        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => new ErrorItem(e.Code, e.Description)));
    }
}
