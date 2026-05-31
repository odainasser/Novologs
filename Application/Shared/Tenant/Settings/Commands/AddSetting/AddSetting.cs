using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Settings.Commands.AddSetting;

public record AddSettingCommand : IRequest<Result<AddSettingResponse>>
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public string? Extra { get; set; } = null;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddSettingCommand, Setting>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));
        }
    }
}

public class AddSettingResponse
{
    public Guid Id { get; set; }
}

public class AddSettingCommandValidator : AbstractValidator<AddSettingCommand>
{
    public AddSettingCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Key)
            .NotEmpty().WithMessage("Key is required.")
            .MaximumLength(200).WithMessage("Key must not exceed 200 characters.");
        RuleFor(v => v.Value)
            .NotEmpty().WithMessage("Value is required.");
    }
}

public class AddSettingCommandHandler : IRequestHandler<AddSettingCommand, Result<AddSettingResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public AddSettingCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<AddSettingResponse>> Handle(AddSettingCommand request, CancellationToken cancellationToken)
    {
        //make the same key all inactive
        var oldSettings = await _context.GetSet<Setting>()
            .Where(s => s.IsActive && s.Key == request.Key)
            .ToListAsync(cancellationToken);
        foreach (var oldSetting in oldSettings)
        {
            oldSetting.IsActive = false;
        }

        var setting = _mapper.Map<Setting>(request);
        await _context.GetSet<Setting>().AddAsync(setting, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddSettingResponse>.Success(new AddSettingResponse() { Id = setting.Id });
    }
}
