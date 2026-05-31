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
  subSort?: string[];
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
}

export interface GetFilePayload {
  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;

  entityType?: number;
  entityId?: string;
}

export interface GetFileResponse {
  successStatus: {
    total: number;
    items: Files[];
  };
  succeeded: boolean;
  errors: any[];
}
export interface Files {
  id: string;
  name: string;
  isFile: boolean;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  parentFolderId: string | null;
  creatorId: string;
  creator: {
    serial: number;
    fullName: string;
    designation: {
      id: string;
      value: string;
      localizedStrings: any[];
    };
    department: {
      id: string;
      value: string;
      localizedStrings: any[];
    };
    folderSharePermissionLevel: number;
  };
  projectId: string | null;
  project: any | null;
  milestoneId: string | null;
  milestone: any | null;
  clientId: string | null;
  client: any | null;
  leadId: string | null;
  lead: any | null;
  vendorId: string | null;
  vendor: any | null;
  contractId: string | null;
  contract: any | null;
  taskId: string | null;
  task: any | null;
  members: any | null;
  subfolders: any[];
  shares: any[];
}

export interface AddFilePayload {
  name: string;
  file: File | null;
  parentFolderId?: string;
  parentFolderPath?: string;
  entityType?: number;
  entityId?: string;
  members?: {
    id: string;
    folderSharePermissionLevel: number;
  }[];
}

export interface shareFilePayload {
  id?: string;
  members: {
    id: string;
    folderSharePermissionLevel?: number;
  }[];
}

export interface UpdateFilePayload {
  id: string;
  name?: string;
  members?: {
    id: string;
    folderSharePermissionLevel?: number;
  }[];
}
