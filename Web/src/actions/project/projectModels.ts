export interface SearchFilter {
  fieldName: string;
  fieldValue: string;
  operator: number;
}
export interface GetProjectPayload {
  search?: {
    fieldName: string;
    fieldValue: any;
    operator: number;
    logicOperator: number;
    subFilters?: SearchFilter[];
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
  type?: number;
}

export interface GetProjectResponse {
  successStatus: {
    total: number;
    items: Projects[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Projects {
  isMission: boolean;
  code: string | null;
  serial: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  creatorId: string;
  creator: any | null;
  departmentId: string;
  department: any | null;
  clientId: string | null;
  client: any | null;
  goalId: string | null;
  goal: any | null;
  initiativeId: string | null;
  initiative: any | null;
  taskTypeId: string | null;
  taskType: any | null;
  moduleId: string | null;
  module: any | null;
  projectMembers: any[];
  tasks: any[];
  mileStones: any[];
  created: string;
  createdBy: string;
  lastModified: string;
  lastModifiedBy: string;
  id: string;
  domainEvents: any[];
  isDeleted: boolean;
  deletedOnDate: string | null;
  deletedBy: string | null;
}

export interface CreateProject {
  code: string;
  name: string;
  type: number;
  isMission?: boolean;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: string | null;
  clientId?: string | null;
  leadId?: string | null;
  vendorId?: string | null;
  contractId?: string | null;
  goalId?: string | null;
  initiativeId?: string | null;
  taskTypeIds?: string[];
  moduleIds?: string[];
  memberList?: any[];
}
export interface UpdateProject {
  id: string;
  code: string;
  name: string;
  type: number;
  isMission?: boolean;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: string | null;
  clientId?: string | null;
  leadId?: string | null;
  vendorId?: string | null;
  contractId?: string | null;
  goalId?: string | null;
  initiativeId?: string | null;
  taskTypeIds?: string[];
  moduleIds?: string[];
  memberList?: any[];
  overviewDocumentId?: string;
  status?: string;
  lifeCycle?: number;
}

export interface DeleteProject {
  id: string;
}

export interface GetGoalResponse {
  successStatus: {
    total: number;
    items: Goal[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Goal {
  id: string;
  nameId: string;
  name: LocalizedName;
}

export interface LocalizedName {
  id: string;
  value: string;
  localizedStrings: LocalizedString[];
  created: string;
  createdBy: string | null;
  lastModified: string;
  lastModifiedBy: string | null;
}

export interface LocalizedString {
  id: string;
  language: string;
  value: string;
  created: string;
  createdBy: string | null;
  lastModified: string;
  lastModifiedBy: string | null;
}

export interface AddGoal {
  name: {
    id?: string;
    value: string;
    localizedStrings?: {
      id: string;
      language: string;
      value: string;
    }[];
  };
}

export interface UpdateGoal {
  id: string;
  name: {
    id: string;
    value: string;
    localizedStrings?: {
      id: string;
      language: string;
      value: string;
    }[];
  };
}

export interface GetModulesPayload {
  projectId: string;
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

export interface GetModulesResponse {
  successStatus: {
    total: number;
    items: {
      id: string;
      projectId: string;
      nameId: string;
      name: {
        id: string;
        value: string;
        localizedStrings: string[];
      };
    }[];
  };
  succeeded: boolean;
  errors: string[];
}

export interface AddModules {
  projectId: string;

  name: {
    id?: string;
    value: string;
    localizedStrings?: {
      id: string;
      language: string;
      value: string;
    }[];
  };
}

export interface UpdateModules {
  id: string;
  projectId: string;
  name: {
    id: string;
    value: string;
    localizedStrings?: {
      id: string;
      language: string;
      value: string;
    }[];
  };
}

export interface AddMilestone {
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
}

export interface GetProjectMilestonePayload {
  projectId: string;
  search?: {
    fieldName: string;
    fieldValue: any;
    operator: number;
    logicOperator: number;
    subFilters?: string[];
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

export interface AddMilestoneTasks {
  milestoneId: string;
  taskIds: string[];
}
