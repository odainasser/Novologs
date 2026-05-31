using Novologs.Application.Modules.Folder.Folders.Dto;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetRepository;

public record GetRepositoryQuery : IRequest<Result<GetRepositoryResponse>>
{
}

public class GetRepositoryResponse
{
    public FilesAndFoldersSection FilesAndFolders { get; set; } = new();
    public SystemGeneratedSection SystemGenerated { get; set; } = new();
}

public class FilesAndFoldersSection
{
    public List<FolderDto> Projects { get; set; } = new();
    public List<FolderDto> Clients { get; set; } = new();
    public List<FolderDto> Vendors { get; set; } = new();
}

public class SystemGeneratedSection
{
    public List<FolderDto> Tasks { get; set; } = new();
    public List<FolderDto> Chat { get; set; } = new();
    public List<FolderDto> Users { get; set; } = new();
}

public class GetRepositoryQueryHandler
    : IRequestHandler<GetRepositoryQuery, Result<GetRepositoryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public GetRepositoryQueryHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetRepositoryResponse>> Handle(
        GetRepositoryQuery request,
        CancellationToken cancellationToken)
    {
        Guid.TryParse(_user.Id, out var userId);

        var baseQuery = _context.GetSet<Novologs.Domain.Entities.Folder>("")
            .Include(f => f.Shares)
            .AsNoTracking()
            .AsSplitQuery()
            .Where(f => f.ParentFolderId == null);

        // Apply access control
        baseQuery = baseQuery.Where(f =>
            f.Type == FolderType.General ||
            f.Type == FolderType.Shared ||
            f.CreatorId == userId ||
            f.Shares.Any(s => s.SharedWithUserId == userId) ||
            (
                !f.Shares.Any() && (
                    (f.Project != null && f.Project.ProjectMembers.Any(m => m.MemberId == userId)) ||
                    (f.Milestone != null && f.Milestone.Project!.ProjectMembers.Any(m => m.Id == userId)) ||
                    (f.Client != null && f.Client.CreatorId == userId) ||
                    (f.Lead != null && f.Lead.CreatorId == userId) ||
                    (f.Vendor != null && f.Vendor.CreatorId == userId) ||
                    (f.Contract != null && f.Contract.CreatorId == userId) ||
                    (f.Task != null && f.Task.Members.Any(m => m.MemberId == userId))
                )
            )
        );

        var projects = await baseQuery
            .Include(f => f.Project)
            .Where(f => f.ProjectId != null)
            .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var clients = await baseQuery
            .Include(f => f.Client)
            .Where(f => f.ClientId != null)
            .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var vendors = await baseQuery
            .Include(f => f.Vendor)
            .Where(f => f.VendorId != null)
            .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var tasks = await baseQuery
            .Include(f => f.Task)
            .Where(f => f.TaskId != null)
            .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var chat = await baseQuery
            .Where(f => f.ChatRoomId != null)
            .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var users = await baseQuery
            .Where(f =>
                f.ProjectId == null &&
                f.MilestoneId == null &&
                f.ClientId == null &&
                f.LeadId == null &&
                f.VendorId == null &&
                f.ContractId == null &&
                f.TaskId == null &&
                f.ChatRoomId == null &&
                f.DocumentNodeId == null &&
                f.CreatorId == userId)
            .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var response = new GetRepositoryResponse
        {
            FilesAndFolders = new FilesAndFoldersSection
            {
                Projects = projects,
                Clients = clients,
                Vendors = vendors
            },
            SystemGenerated = new SystemGeneratedSection
            {
                Tasks = tasks,
                Chat = chat,
                Users = users
            }
        };

        return Result<GetRepositoryResponse>.Success(response);
    }
}
