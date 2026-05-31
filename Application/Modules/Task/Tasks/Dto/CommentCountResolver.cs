using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Tasks.Dto;

public class CommentCountResolver : IValueResolver<ProjectTask, ProjectTaskDto, int>
{
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext contextDb;

    public CommentCountResolver(ITenantDbContext contextDb, IMapper mapper, IUser user,
        UserManager<TenantUser> userManager)
    {
        this.contextDb = contextDb;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public int Resolve(ProjectTask source, ProjectTaskDto destination, int destMember, ResolutionContext context)
    {
        if (source.CommentThread == null)
        {
            return 0;
        }

        var userId = _user.IdGuid;
        if (!userId.HasValue)
        {
            return 0;
        }

        //TODO remove one of them
        var hasViewAllPermission = _userManager.HasPermissionAsync(contextDb, userId.Value,
            Novologs.Domain.Constants.Permissions.Comments.ViewAll).Result;
        var hasReadPermission = _userManager.HasPermissionAsync(contextDb, userId.Value,
            Novologs.Domain.Constants.Permissions.Comments.Read).Result;

        if (hasViewAllPermission || hasReadPermission)
        {
            return source.CommentThread.Items.Count;
        }
        else
        {
            return source.CommentThread.Items.Count(ci =>
                ci.SenderId == userId || ci.Mentions.Any(m => m.UserId == userId));
        }
    }
}
