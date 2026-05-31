using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.CompanyBranches.Commands.DeleteCompanyBranch;

public record DeleteCompanyBranchCommand : IRequest<Result<DeleteCompanyBranchResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteCompanyBranchResponse
{
}

public class DeleteCompanyBranchCommandValidator : AbstractValidator<DeleteCompanyBranchCommand>
{
    public DeleteCompanyBranchCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Domain.Entities.CompanyBranch>()
                    .AnyAsync(cb => cb.Id == id, cancellationToken);
            }).WithMessage("Company Branch not found.");
    }
}

public class DeleteCompanyBranchCommandHandler : IRequestHandler<DeleteCompanyBranchCommand, Result<DeleteCompanyBranchResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteCompanyBranchCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteCompanyBranchResponse>> Handle(DeleteCompanyBranchCommand request,
        CancellationToken cancellationToken)
    {
        var companyBranch = await _context.GetSet<Domain.Entities.CompanyBranch>()
            .FirstOrDefaultAsync(cb => cb.Id == request.Id, cancellationToken);

        if (companyBranch == null)
        {
            return Result<DeleteCompanyBranchResponse>.Failure("CompanyBranch_003", "Company Branch not found");
        }

        _context.GetSet<Domain.Entities.CompanyBranch>().Remove(companyBranch);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteCompanyBranchResponse>.Success(new DeleteCompanyBranchResponse());
    }
}

