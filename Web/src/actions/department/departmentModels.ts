export interface GetDeptPayload {
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

export interface GetDeptResponse {
  successStatus: {
    total: number;
    items: Department[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Department {
  parentDepartmentId: string | null;
  nameId: string;
  name: LocalizedName;
  parentDepartment: Department | null;
  childDepartments: Department[];
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
}

export interface LocalizedName {
  value: string;
  localizedStrings: any[];
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

export interface AddDepartment {
  parentDepartmentId: string | null;
  name: {
    value: string;
    localizedStrings?: {
      localizableId: string | null;
      language: string;
      value: string;
    }[];
  };
}

export interface UpdateDepartment {
  id: string;
  parentDepartmentId: string | null;
  name: {
    value: string;
    localizedStrings?: {
      localizableId: string | null;
      language: string;
      value: string;
    }[];
  };
}

export interface DeleteDepartment {
  id: string;
}
