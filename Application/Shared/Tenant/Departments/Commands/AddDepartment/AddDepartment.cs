using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Departments.Commands.AddDepartment;

public record AddDepartmentCommand : IRequest<Result<AddDepartmentResponse>>
{
    public Guid? ParentDepartmentId { get; set; }
    public required LocalizableTextDto Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddDepartmentCommand, Domain.Entities.Department>();
        }
    }
}

public class AddDepartmentCommandValidator : AbstractValidator<AddDepartmentCommand>
{
    public AddDepartmentCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Name).NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name.Value)
            .NotEmpty().WithMessage("Name.Value is required.")
            .MaximumLength(2048).WithMessage("Name.Value must not exceed 2048 characters.")
            .MustAsync(async (name, cancellationToken) =>
            {
                return !await context.GetSet<Department>()
                    .AnyAsync(d => d.Name.Value.ToLower().Trim() == name.ToLower().Trim() , cancellationToken);
            }).WithMessage("The specified name already exists.");
    }
} 

public class AddDepartmentResponse
{
    public Guid Id { get; set; }
}

public class AddDepartmentCommandHandler : IRequestHandler<AddDepartmentCommand, Result<AddDepartmentResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddDepartmentCommandHandler(
        ITenantDbContext context,
        IMapper mapper
    )
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddDepartmentResponse>> Handle(AddDepartmentCommand request,
        CancellationToken cancellationToken)
    {
        var department = _mapper.Map<Domain.Entities.Department>(request);
        await _context.GetSet<Domain.Entities.Department>().AddAsync(department, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        if (department.ParentDepartmentId == null)
        {
            var rootStructure = await _context.GetSet<OrganizationStructure>()
                .FirstOrDefaultAsync(s => s.ParentStructureId == null, cancellationToken: cancellationToken);

            if (rootStructure != null)
            {
                var childStructure = new OrganizationStructure(Guid.NewGuid())
                {
                    ParentStructureId = rootStructure.Id, DepartmentId = department.Id
                };
                await _context.GetSet<OrganizationStructure>().AddAsync(childStructure, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }


        return Result<AddDepartmentResponse>.Success(new AddDepartmentResponse { Id = department.Id });
    }
}
