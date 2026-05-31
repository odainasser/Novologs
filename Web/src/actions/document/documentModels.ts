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

export interface GetDocumentPayload {
  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;
}

export interface GetDocumentResponse {
  successStatus: {
    total: number;
    items: [];
  };
  succeeded: boolean;
  errors: any[];
}

export interface CreateDocument {
  type?: number;
  visibiltiy?: number;
  status?: number;
  parentDocumentId?: string;
  documentCategoryId?: string;
  members?: Member[];
  documentContent: {
    content: string;
    id?: string;
    version?: string;
    title?: string;
    description?: string;
    headerImgFileId?: string;
    filesIds?: string[];
  };
  taskId?: string;
  mileStoneId?: string;
  projectId?: string;
  clientId?: string;
  clientLeadId?: string;
  vendorId?: string;
  vendorContractId?: string;
}

export interface Member {
  id?: string;
  memberId?: string;
  role?: number;
  isMention?: boolean;
}

export interface UpdateDocument {
  id: string;
  currentVersion?: string;
  title?: string;
  type?: number;
  visibiltiy?: number;
  status?: number;
  parentDocumentId?: string;
  documentCategoryId?: string;
  members?: Member[];
  documentContent: {
    content: string;
    id?: string;
    version?: string;
    title?: string;
    description?: string;
    headerImgFileId?: string;
    filesIds?: string[];
  };
  taskId?: string;
  mileStoneId?: string;
  projectId?: string;
  clientId?: string;
  clientLeadId?: string;
  vendorId?: string;
  vendorContractId?: string;
}

export interface GetDocumentCommentPayload {
  threadId: string;

  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;
}
export interface GetDocumentCommentResponse {
  successStatus: {
    total: number;
    items: DocumentComment[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface DocumentComment {
  id: string;
  content: string;
  threadId: string;
  senderId: string;
  sender: Sender;
  files: any[];
  mentions: any[];
}

export interface Sender {
  id: string;
  fullName: string;
  profileImageUrl: string;
}

export interface AddDocumentComments {
  threadId: string;
  content: string;
  filesIds?: string[];
  mentionedUsersIds?: string[];
}
