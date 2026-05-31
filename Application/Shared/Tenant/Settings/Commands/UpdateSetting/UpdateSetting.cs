using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Settings.Commands.UpdateSetting;

public record UpdateSettingCommand : IRequest<Result<UpdateSettingResponse>>
{
    public Guid? Id { get; set; }
    public string? Key { get; set; } = null!;
    public string? Value { get; set; }
    public bool? IsActive { get; set; }
    public string? Extra { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateSettingCommand, Domain.Entities.Setting>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null))
                ;
        }
    }
}

public class UpdateSettingResponse
{
}

public class UpdateSettingCommandValidator : AbstractValidator<UpdateSettingCommand>
{
    public UpdateSettingCommandValidator(ITenantDbContext context, IUser user)
    {
        When(s => s.Id.HasValue, () =>
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("Id is required.")
                .MustAsync(async (id, cancellationToken) =>
                {
                    return await context.GetSet<Domain.Entities.Setting>()
                        .AnyAsync(s => s.Id == id, cancellationToken);
                }).WithMessage("Setting not found.")
                .When(v => v.Id != null);
        });

        When(s => s.Id.HasValue == false, () =>
        {
            RuleFor(v => v.Key)
                .NotEmpty().WithMessage("Key is required.")
                .MaximumLength(200).WithMessage("Key must not exceed 200 characters.");
            RuleFor(v => v.Key)
                .MustAsync(async (key, cancellationToken) =>
                {
                    return await context.GetSet<Domain.Entities.Setting>()
                        .AnyAsync(s => s.Key == key, cancellationToken);
                }).WithMessage("Setting not found.");
        });
    }
}

public class UpdateSettingCommandHandler : IRequestHandler<UpdateSettingCommand, Result<UpdateSettingResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public UpdateSettingCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<UpdateSettingResponse>> Handle(UpdateSettingCommand request,
        CancellationToken cancellationToken)
    {
        Setting? setting;
        if (request.Id.HasValue)
        {
            setting = await _context.GetSet<Domain.Entities.Setting>()
                .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
        }
        else
        {
            setting = await _context.GetSet<Domain.Entities.Setting>()
                .OrderByDescending(s => s.Created)
                .FirstOrDefaultAsync(s => s.Key == request.Key, cancellationToken);
        }

        if (setting == null)
        {
            return Result<UpdateSettingResponse>.Failure("Setting_001", "Setting not found.");
        }

        _mapper.Map(request, setting);
        if (setting.IsActive)
        {
            var oldSettings = await _context.GetSet<Domain.Entities.Setting>()
                .Where(s => s.IsActive && s.Key == setting.Key && s.Id != setting.Id)
                .ToListAsync(cancellationToken);
            foreach (var oldSetting in oldSettings)
            {
                oldSetting.IsActive = false;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateSettingResponse>.Success(new UpdateSettingResponse());
    }
}
