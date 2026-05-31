export interface Filter {
  fieldName: string;
  fieldValue: string;
  operator: number;
  logicOperator: number;
  subFilters: string[];
}

export interface Sort {
  fieldName: string;
  sortDirection: number;
  subSort: string[];
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
}

export interface GetTimesheetPayload {
  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;
}

export interface GetTimesheetResponse {
  successStatus: {
    total: number;
    items: [];
  };
  succeeded: boolean;
  errors: any[];
}

export interface CreateTimesheet {
  taskId: string;
  date: string;
  timeSlots: {
    startTime: string;
    durationInMinutes: number;
    description?: string;
  }[];
}

export interface UpdateTimesheet {
  id: string;
  taskId: string;
  date: string;
  timeSlots: {
    startTime: string;
    durationInMinutes: number;
    description?: string;
  }[];
}

export interface GetCostPayload {
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
