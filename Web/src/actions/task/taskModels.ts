export interface SearchFilter {
  fieldName: string;
  fieldValue: string;
  operator: number;
}
export interface Filter {
  fieldName: string;
  fieldValue: string;
  operator: number;
  logicOperator: number;
  subFilters?: SearchFilter[];
}

export interface Sort {
  fieldName: string;
  sortDirection: number;
  subSort?: string[];
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
}

export interface GetTaskPayload {
  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;

  userIds?: string[];
  myEmployee?: boolean;
  creatFilter?: number;
  controlEntity?: number;
  controlEntityId?: string;
  statusIds?: string[];
  categoryId?: string[];
  priorityId?: string[];
  overdue?: boolean;
}

export interface GetTaskResponse {
  successStatus: {
    total: number;
    items: Task[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Task {
  code: string;
  serial: number;
  creatorId: string;
  creator: User;
  isConfidential: boolean;
  isAssignedToMe: boolean;
  description: string;
  startDate: string | null;
  endDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  projectId: string | null;
  project: any | null;
  mileStoneId: string | null;
  mileStone: any | null;
  clientId: string | null;
  client: any | null;
  clientLeadId: string | null;
  clientLead: any | null;
  vendorId: string | null;
  vendor: any | null;
  vendorContractId: string | null;
  vendorContract: any | null;
  statusId: string;
  status: Status;
  categoryId: string | null;
  category: any | null;
  priorityId: string | null;
  priority: any | null;
  parentTaskId: string | null;
  parentTask: any | null;
  childTasks: any[];
  members: any[];
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

export interface User {
  code: string;
  serial: number;
  fullName: string;
  country: string;
  language: string;
  userType: number;
  designationId: string;
  designation: any | null;
  departmentId: string;
  department: any | null;
  memberProjects: any[];
  memeberTasks: any[];
  isDeleted: boolean;
  deletedOnDate: string | null;
  deletedBy: string | null;
  created: string;
  createdBy: string | null;
  lastModified: string;
  lastModifiedBy: string | null;
  id: string;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface Status {
  status: number;
  nameId: string;
  name: any | null;
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

export interface CreateTasks {
  code: string;
  description: string;
  projectId?: string;
  mileStoneId?: string;
  clientId?: string;
  clientLeadId?: string;
  vendorId?: string;
  vendorContractId?: string;
  membersIds?: string[];
  isConfidential?: boolean;
  isAssignedToMe?: boolean;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  priorityId?: string;
  parentTaskId?: string;
  audioFileId?: string;
  IsChatMessage?: boolean;
  ChatMessageId?: string;
}

export interface UpdateTask {
  id: string;
  code: string;
  description: string;
  projectId?: string;
  mileStoneId?: string;
  clientId?: string;
  clientLeadId?: string;
  vendorId?: string;
  vendorContractId?: string;
  membersIds?: string[];
  isConfidential?: boolean;
  isAssignedToMe?: boolean;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  priorityId?: string;
  parentTaskId?: string;
  documentId?: string;
}

export interface GetStatusPayload {
  search?: Filter;
  sort?: Sort;
  pagination: Pagination;
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

export interface Name {
  id: string;
  value: string;
  localizedStrings: LocalizedString[];
  created: string;
  createdBy: string | null;
  lastModified: string;
  lastModifiedBy: string | null;
}

export interface StatusItem {
  id: string;
  name: Name;
}

export interface SuccessStatus {
  total: number;
  items: StatusItem[];
}

export interface GetStatusResponse {
  successStatus: SuccessStatus;
  succeeded: boolean;
  errors: any[];
}

export interface DeleteTask {
  id: string;
}

export interface AddStatus {
  name: {
    id?: string;
    value: string;
    localizedStrings?: {
      id: string;
      language: string;
      value: string;
    }[];
  };
  color?: string;
}

export interface UpdateStatus {
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
  color?: string;
}

export interface DeleteStatus {
  id: string;
}

export interface ChangeStatus {
  taskId: string;
  statusId: string;
  userId?: string;
}

export interface AddTodo {
  content: string;
  taskId: string;
  reminderDateTime?: string;
  memberIds?: string[];
}

export interface UpdateTodo {
  id: string;
  content: string;
  reminderDateTime?: string;
  memberIds?: string[];
}
export interface GetTodoPayload {
  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;
}

export interface GetTodoResponse {
  successStatus: {
    total: number;
    items: [];
  };
  succeeded: boolean;
  errors: any[];
}

export interface ChangeTodoStatus {
  id: string;
  status: number;
}

export interface GetProjectCategoryPayload {
  pagination: Pagination;
  projectId: number;
  search?: Filter;
  sort?: Sort;
}

export interface GetUserPayload {
  search?: {
    fieldName: string;
    fieldValue: string;
    operator: number;
    logicOperator: number;
    subFilters?: string[];
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
  employeeId: string;
}
export interface TranscribeTask {
  taskId: string;
}
