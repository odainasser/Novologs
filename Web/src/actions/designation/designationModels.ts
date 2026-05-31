export interface GetDesignationPayload {
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
    subSort: string[];
  };
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface GetDesignationResponse {
  successStatus: {
    total: number;
    items: Designation[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Designation {
  nameId: string;
  name: LocalizedName;
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

export interface DeleteDesignation {
  id: string;
}

export interface AddDesignation {
  name: {
    value: string;
    localizedStrings?: {
      localizableId: string;
      language: string;
      value: string;
    }[];
  };
}

export interface UpdateDesignation {
  id: string;
  name: {
    id: string;
    value: string;
    localizedStrings?: {
      id?: string;
      language: string;
      value: string;
    }[];
  };
}
