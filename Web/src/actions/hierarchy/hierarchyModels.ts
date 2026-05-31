export interface GetHierarchyPayload {
  search?: {
    fieldName: string;
    fieldValue: string;
    operator: number;
    logicOperator: number;
    subFilters: string[];
  };
  sort?: {
    fieldName: string;
    sortDirection: number;
    subSort?: string[];
  };
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface GetHierarchyResponse {
  successStatus: {
    total: number;
    items: Hierarchy[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Hierarchy {
  parentStructureId: string;
  parentStructure: any | null;
  employeeId: string | null;
  employee: any | null;
  departmentId: string;
  department: {
    parentDepartmentId: string | null;
    nameId: string;
    name: string | null;
    parentDepartment: any | null;
    childDepartments: any[];
    employees: any[];
    created: string;
    createdBy: string | null;
    lastModified: string;
    lastModifiedBy: string | null;
    id: string;
    domainEvents: any[];
    isDeleted: boolean;
    deletedOnDate: string | null;
    deletedBy: string | null;
  };
  children: Hierarchy[];
  created: string;
  createdBy: string | null;
  lastModified: string;
  lastModifiedBy: string | null;
  id: string;
  domainEvents: any[];
  isDeleted: boolean;
  deletedOnDate: string | null;
  deletedBy: string | null;
}

export interface AddUserToHierarchy {
  nodeToInsertId: string;
  destinationParentNodeId: string;
}
export interface SwapUserInHierarchy {
  sourceNodeId: string;
  targetNodeId: string;
}

export interface DeleteUserFromHierarchy {
  nodeToDeleteId: string;
}
