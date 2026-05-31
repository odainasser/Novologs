using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Departments.Commands.DeleteDepartment;

public record DeleteDepartmentCommand : IRequest<Result<DeleteDepartmentResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteDepartmentCommandValidator : AbstractValidator<DeleteDepartmentCommand>
{
    public DeleteDepartmentCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id).MustAsync(async (id, cancellationToken) =>
        {
            return await context.GetSet<Domain.Entities.Department>().AnyAsync(d => d.Id == id, cancellationToken);
        }).WithMessage("Department with this id does not exist.");

        RuleFor(v => v.Id).MustAsync(async (id, cancellationToken) =>
        {
            var department = await context.GetSet<Domain.Entities.Department>()
                .Include(d => d.ChildDepartments)
                .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
            return department == null || !department.ChildDepartments.Any();
        }).WithMessage("Cannot delete a department with child departments.");
        RuleFor(v => v.Id).MustAsync(async (id, cancellationToken) =>
        {
            var departmentList = await context.GetSet<Domain.Entities.Department>()
                .Include(d => d.Employees)
                .Include(d => d.ChildDepartments)
                .ToListAsync(cancellationToken);
            var department = departmentList.FirstOrDefault(d => d.Id == id);
            if (department == null) return true;
            var allEmployees = GetAllEmployees(department, departmentList);
            return !allEmployees.Any();
        }).WithMessage("Cannot delete a department with employees.");
    }

    private List<TenantUser> GetAllEmployees(Department department, List<Department> departmentList)
    {
        var allEmployees = new List<TenantUser>();
        allEmployees.AddRange(department.Employees);

        var childDepartments = departmentList.Where(d => d.ParentDepartmentId == department.Id).ToList();
        foreach (var child in childDepartments)
        {
            allEmployees.AddRange(GetAllEmployees(child, departmentList) as List<TenantUser> ?? new List<TenantUser>());
        }

        return allEmployees;
    }
}

public class DeleteDepartmentResponse
{
}

public class DeleteDepartmentCommandHandler : IRequestHandler<DeleteDepartmentCommand, Result<DeleteDepartmentResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteDepartmentCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteDepartmentResponse>> Handle(DeleteDepartmentCommand request,
        CancellationToken cancellationToken)
    {
        var department = await _context.GetSet<Domain.Entities.Department>()
            .FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken);
        if (department == null)
        {
            return Result<DeleteDepartmentResponse>.Failure("Department_001", "Department not found.");
        }

        _context.GetSet<Domain.Entities.Department>().Remove(department);
        await _context.SaveChangesAsync(cancellationToken);

        var node = await _context.GetSet<Domain.Entities.OrganizationStructure>()
            .Include(n => n.Children)
            .FirstOrDefaultAsync(n => n.DepartmentId == department.Id, cancellationToken: cancellationToken);
        if (node != null)
        {
            if (node.Children.Any())
            {
                node.DepartmentId = null;
            }
            else
            {
                _context.GetSet<Domain.Entities.OrganizationStructure>().Remove(node);
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result<DeleteDepartmentResponse>.Success(new DeleteDepartmentResponse());
    }
}
