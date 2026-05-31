using System.Text.Json;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.Tenant.Queries.GetTenantInfo;

public record GetTenantInfoQuery : IRequest<Result<GetTenantInfoResponse>>
{
}

public class GetTenantInfoResponse
{
    public TenantInfoDto? TenantInfo { get; set; }
    public List<TenantUserInfoDto>? Users { get; set; }
    public UsersStatisticsDto? UsersStatistics { get; set; }
}

public class TenantInfoDto
{
    public string? TenantName { get; set; }
    public LicenseInfo? License { get; set; }
    public StorageInfo? Storage { get; set; }
}

public class LicenseInfo
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalUsers { get; set; }
    public int UsedUsers { get; set; }
    public int RemainingUsers { get; set; }
}

public class StorageInfo
{
    public long TotalGB { get; set; }
    public long UsedBytes { get; set; }
    public long RemainingBytes { get; set; }
}

public class TenantUserInfoDto
{
    public Guid Id { get; set; }
    public long Serial { get; set; }
    public string? Code { get; set; }
    public string? UserName { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public bool IsActive { get; set; }
    public long StorageUsed { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TenantUser, TenantUserInfoDto>()
                .ForMember(dest => dest.ProfileImageUrl,
                    opt => opt.MapFrom(src => src.ProfileImageFile != null ? src.ProfileImageFile.Url : null))
                .ForMember(dest => dest.Designation,
                    opt => opt.MapFrom(src => src.Designation != null ? src.Designation.Name.Value : null))
                .ForMember(dest => dest.Department,
                    opt => opt.MapFrom(src => src.Department != null ? src.Department.Name.Value : null));
        }
    }
}

public class UsersStatisticsDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Inactive { get; set; }
}

public class GetTenantInfoQueryValidator : AbstractValidator<GetTenantInfoQuery>
{
    public GetTenantInfoQueryValidator(ITenantDbContextFactory dbContextFactory, IUser user)
    {
    }
}



public class GetTenantInfoQueryHandler : IRequestHandler<GetTenantInfoQuery, Result<GetTenantInfoResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _tenantInfoAccessor;
    private readonly IConfiguration _configuration;

    public GetTenantInfoQueryHandler(ITenantDbContext context, IUser user, IMapper mapper,
        IMultiTenantContextAccessor<AppTenantInfo> tenantInfoAccessor, IConfiguration configuration)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _tenantInfoAccessor = tenantInfoAccessor;
        _configuration = configuration;
    }


    public async Task<Result<GetTenantInfoResponse>> Handle(GetTenantInfoQuery request,
        CancellationToken cancellationToken)
    {
        var tenantInfo = _tenantInfoAccessor.MultiTenantContext?.TenantInfo;
        if (tenantInfo == null)
        {
            return Result<GetTenantInfoResponse>.Failure("Tenant.NotFound", "Tenant information not found.");
        }

        var policy = !string.IsNullOrEmpty(tenantInfo.Policy)
            ? JsonSerializer.Deserialize<TenantPolicy>(tenantInfo.Policy,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            : null;

        if (policy == null)
        {
            policy = new TenantPolicy
            {
                MaxUsers = _configuration.GetValue<int>("DefaultTenantPolicy:MaxUsers"),
                MaxStorageGB = _configuration.GetValue<int>("DefaultTenantPolicy:MaxStorageGB"),
                LicenseStartDate = _configuration.GetValue<DateTime>("DefaultTenantPolicy:LicenseStartDate"),
                LicenseDurationMonths = _configuration.GetValue<int>("DefaultTenantPolicy:LicenseDurationMonths"),
                PaymentApproval = _configuration.GetValue<bool>("DefaultTenantPolicy:PaymentApproval"),
                SupportEmail = _configuration.GetValue<string>("DefaultTenantPolicy:SupportEmail"),
                AlertStoragePercentage = _configuration.GetValue<double>("DefaultTenantPolicy:AlertStoragePercentage")
            };
        }

        var users = await _context.GetSet<TenantUser>()
            .Include(u => u.ProfileImageFile)
            .Include(u => u.Designation)
            .ThenInclude(d => d!.Name)
            .Include(u => u.Department)
            .ThenInclude(d => d!.Name)
            .ToListAsync(cancellationToken);

        var totalStorageUsed = await _context.GetSet<Domain.Entities.Folder>().Where(f => f.IsFile)
            .SumAsync(f => f.Size ?? 0, cancellationToken);

        var usersInfo = new List<TenantUserInfoDto>();
        foreach (var user in users)
        {
            var userInfoDto = _mapper.Map<TenantUserInfoDto>(user);
            userInfoDto.StorageUsed = await _context.GetSet<Domain.Entities.Folder>()
                .Where(f => f.IsFile && f.CreatorId == user.Id)
                .SumAsync(f => f.Size ?? 0, cancellationToken);
            usersInfo.Add(userInfoDto);
        }

        var totalUsers = users.Count;
        var activeUsers = users.Count(u => u.IsActive);

        var response = new GetTenantInfoResponse
        {
            TenantInfo = new TenantInfoDto
            {
                TenantName = tenantInfo.Name,
                License = new LicenseInfo
                {
                    StartDate = policy.LicenseStartDate,
                    EndDate = policy.LicenseStartDate.AddMonths(policy.LicenseDurationMonths),
                    TotalUsers = policy.MaxUsers,
                    UsedUsers = totalUsers,
                    RemainingUsers = policy.MaxUsers - totalUsers
                },
                Storage = new StorageInfo
                {
                    TotalGB = policy.MaxStorageGB,
                    UsedBytes = totalStorageUsed,
                    RemainingBytes = (policy.MaxStorageGB * 1024L * 1024L * 1024L) - totalStorageUsed
                }
            },
            Users = usersInfo,
            UsersStatistics = new UsersStatisticsDto
            {
                Total = totalUsers, Active = activeUsers, Inactive = totalUsers - activeUsers
            }
        };

        return Result<GetTenantInfoResponse>.Success(response);
    }
}
