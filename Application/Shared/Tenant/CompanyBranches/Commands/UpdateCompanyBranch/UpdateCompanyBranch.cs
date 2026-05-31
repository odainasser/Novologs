using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.CompanyBranches.Commands.UpdateCompanyBranch;

public record UpdateCompanyBranchCommand : IRequest<Result<UpdateCompanyBranchResponse>>
{
    public Guid Id { get; set; }
    public string? Name { get; set; } = null!;
    public string? Code { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateCompanyBranchCommand, Domain.Entities.CompanyBranch>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}

public class UpdateCompanyBranchResponse
{
}

public class UpdateCompanyBranchCommandValidator : AbstractValidator<UpdateCompanyBranchCommand>
{
    public UpdateCompanyBranchCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Domain.Entities.CompanyBranch>()
                    .AnyAsync(cb => cb.Id == id, cancellationToken);
            }).WithMessage("Company Branch not found.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                return !await context.GetSet<Domain.Entities.CompanyBranch>()
                    .AnyAsync(cb => cb.Name.Trim().ToLower() == name.Trim().ToLower() && cb.Id != command.Id,
                        cancellationToken);
            }).WithMessage("Name already exists.");

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (command, code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<Domain.Entities.CompanyBranch>()
                    .AnyAsync(cb => cb.Code!.Trim().ToLower() == code.Trim().ToLower() && cb.Id != command.Id,
                        cancellationToken);
            }).WithMessage("Code already exists.");

        RuleFor(v => v.Phone)
            .MaximumLength(20).WithMessage("Phone must not exceed 20 characters.");

        RuleFor(v => v.Email)
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters.")
            .EmailAddress().When(v => !string.IsNullOrEmpty(v.Email)).WithMessage("Invalid email format.");

        RuleFor(v => v.Country)
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters.");

        RuleFor(v => v.City)
            .MaximumLength(100).WithMessage("City must not exceed 100 characters.");

        RuleFor(v => v.Address)
            .MaximumLength(2048).WithMessage("Address must not exceed 2048 characters.");
    }
}

public class
    UpdateCompanyBranchCommandHandler : IRequestHandler<UpdateCompanyBranchCommand, Result<UpdateCompanyBranchResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateCompanyBranchCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateCompanyBranchResponse>> Handle(UpdateCompanyBranchCommand request,
        CancellationToken cancellationToken)
    {
        var companyBranch = await _context.GetSet<Domain.Entities.CompanyBranch>()
            .FirstOrDefaultAsync(cb => cb.Id == request.Id, cancellationToken);

        if (companyBranch == null)
        {
            return Result<UpdateCompanyBranchResponse>.Failure("CompanyBranch_002", "Company Branch not found.");
        }

        _mapper.Map(request, companyBranch);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateCompanyBranchResponse>.Success(new UpdateCompanyBranchResponse());
    }
}
