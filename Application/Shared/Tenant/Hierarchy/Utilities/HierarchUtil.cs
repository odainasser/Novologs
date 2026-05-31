using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Utilities;

public static class HierarchUtil
{
    public static void ClearHierarchyParent(OrganizationStructure nodeToDelete)
    {
        //check if all parents of the source node are empty nodes (employee=null, department == null) then delete the node (mark as deleted)
        var nodeToCheck = nodeToDelete;
        while (nodeToCheck != null)
        {
            if (nodeToCheck.EmployeeId == null && nodeToCheck.DepartmentId == null &&
                CheckForEmptyDescendants(nodeToCheck))
            {
                nodeToCheck.IsDeleted = true;
                nodeToCheck.DeletedOnDate = DateTime.UtcNow;
                nodeToCheck.DeletedBy = "System";
                nodeToCheck = nodeToCheck.ParentStructure;
            }
            else
            {
                nodeToCheck = null;
            }
        }
    }

    //check if all descendants of the source node are empty nodes (employee=null, department == null)
    public static bool CheckForEmptyDescendants(OrganizationStructure sourceNode)
    {
        if (sourceNode.Children.Any(c => c.EmployeeId != null || c.Department != null)) return false;
        foreach (var child in sourceNode.Children)
        {
            if (child.IsDeleted) continue;
            var subRes = CheckForEmptyDescendants(child);
            if (subRes == false) return false;
        }

        return true;
    }

    //function to get all descendant employees (children and sub children ...) of a node
    public static List<Guid> GetAllDescendantEmployeesIds(OrganizationStructure node)
    {
        var employees = new List<Guid>();
        if (node.EmployeeId != null)
        {
            employees.Add(node.EmployeeId.Value);
        }

        foreach (var child in node.Children)
        {
            if (!child.IsDeleted)
            {
                employees.AddRange(GetAllDescendantEmployeesIds(child));
            }
        }

        return employees;
    }

    //function to get the employee's level in hierarch if in (parent node is) default (admin or general) return -1 if don't exist return -2
    public static int GetEmployeeLevel(OrganizationStructure? node)
    {
        if (node == null) return -1;
        if (node.ParentStructure == null) return 0;
        if (node.ParentStructure.Department?.Name.Value is "Admin" or "General")
        {
            return -1;
        }

        var level = 0;
        var currentNode = node;
        while (currentNode.ParentStructure != null && currentNode.ParentStructure.Department?.Name.Value != "Admin" &&
               currentNode.ParentStructure.Department?.Name.Value != "General")
        {
            if (currentNode.Department != null)
            {
                level++;
            }

            currentNode = currentNode.ParentStructure;
        }

        return level;
    }

    //function to return employees in a certain level
    public static List<Guid> GetEmployeesInLevel(OrganizationStructure node, int level)
    {
        var employees = new List<Guid>();
        if (level == 0 && node.EmployeeId != null)
        {
            employees.Add(node.EmployeeId.Value);
        }
        else if (level > 0)
        {
            foreach (var child in node.Children)
            {
                if (!child.IsDeleted)
                {
                    employees.AddRange(GetEmployeesInLevel(child, level - 1));
                }
            }
        }

        return employees;
    }

    public static List<Guid> GetEmployeeIdsUnderLevel(List<OrganizationStructure> nodeList, int level)
    {
        var root = nodeList.FirstOrDefault(n => n.ParentStructureId is null);
        if (root == null) return new List<Guid>();

        var baseLevelEmplIds = GetEmployeesInLevel(root, level);

        var employeesIds = new List<OrganizationStructure>();
        foreach (var emplId in baseLevelEmplIds)
        {
            var emplNode =
                nodeList.FirstOrDefault(n => n.EmployeeId == emplId && n.Children.Any(c => c.EmployeeId != null));

            if (emplNode != null)
            {
                var children = emplNode.Children.Where(n => n.EmployeeId != null);
                employeesIds.AddRange(children);
            }
        }

        return employeesIds.Select(e => e.EmployeeId!.Value).ToList();
    }


    public static OrganizationStructure? GetEmployeeDirectManager(OrganizationStructure? employeeNode)
    {
        if (employeeNode == null) return null;
        var currentNode = employeeNode;
        while (currentNode.ParentStructure != null)
        {
            if (currentNode.ParentStructure.EmployeeId != null)
            {
                return currentNode.ParentStructure;
            }

            currentNode = currentNode.ParentStructure;
        }

        return null;
    }


    public static Dictionary<Guid, HierarchyWithLevelAndParentModel> GetEmployeesLevelAndManagerDictionary(
        OrganizationStructure? organization)
    {
        var result = new Dictionary<Guid, HierarchyWithLevelAndParentModel>();
        if (organization == null) return result;
        if (organization.EmployeeId != null)
        {
            var root = new HierarchyWithLevelAndParentModel
            {
                Id = organization.EmployeeId.Value, Level = 0, Parent = null, node = organization,
            };
            result.Add(root.Id!.Value, root);
            var subresult = LevelAndManagerParserDictionary(root.node, root.Level, root.Parent, result);
            foreach (var sub in subresult)
            {
                if (!result.ContainsKey(sub.Key))
                {
                    result.Add(sub.Key, sub.Value);
                }
            }
        }

        return result;
    }

    private static Dictionary<Guid, HierarchyWithLevelAndParentModel> LevelAndManagerParserDictionary(
        OrganizationStructure parentNode,
        int parentLevel, TenantUser? parent, Dictionary<Guid, HierarchyWithLevelAndParentModel> result)
    {
        foreach (var child in parentNode.Children)
        {
            if (child.EmployeeId != null)
            {
                var directManager = GetEmployeeDirectManager(child);
                var newEmployee = new HierarchyWithLevelAndParentModel
                {
                    Id = child.EmployeeId.Value,
                    Level = parentLevel + 1,
                    Parent = directManager?.Employee,
                    node = child,
                };
                result.Add(newEmployee.Id!.Value, newEmployee);
                var subresult = LevelAndManagerParserDictionary(newEmployee.node, newEmployee.Level, newEmployee.Parent,
                    result);
                foreach (var sub in subresult)
                {
                    if (!result.ContainsKey(sub.Key))
                    {
                        result.Add(sub.Key, sub.Value);
                    }
                }
            }
            else
            {
                foreach (var departmentChild in child.Children)
                {
                    var subresult = LevelAndManagerParserDictionary(departmentChild, parentLevel, parent, result);
                    foreach (var sub in subresult)
                    {
                        if (!result.ContainsKey(sub.Key))
                        {
                            result.Add(sub.Key, sub.Value);
                        }
                    }
                }
            }
        }

        return result;
    }

    //get task available members
    public static List<Guid> GetTaskAvailableMembers(List<OrganizationStructure> organizationStructure,
        Guid? currentUserId, int taskLevelElveator)
    {
        var allVisibleUsersIds = new List<Guid?>();

        var currentUserNode = organizationStructure
            .FirstOrDefault(d => d.EmployeeId == currentUserId);

        if (currentUserNode != null)
        {
            var currentUserLevel = GetEmployeeLevel(currentUserNode);
            currentUserLevel = currentUserLevel - taskLevelElveator;
            if (currentUserLevel > 0)
            {
                allVisibleUsersIds.AddRange(GetEmployeesInLevel(currentUserNode, currentUserLevel)
                    .Select(id => (Guid?)id));
                allVisibleUsersIds.AddRange(GetEmployeeIdsUnderLevel(organizationStructure, currentUserLevel)
                    .Select(id => (Guid?)id));
            }
            else
            {
                allVisibleUsersIds.AddRange(organizationStructure.Where(n => n.EmployeeId.HasValue)
                    .Select(n => n.EmployeeId));
            }
        }
        else
        {
            allVisibleUsersIds.Add(currentUserId);
        }

        return allVisibleUsersIds.Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
    }
}
