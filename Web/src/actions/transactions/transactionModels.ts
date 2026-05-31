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
export interface GetTransactionPayload {
  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;
  accountType?: number;
  accountCategory?: number;
  isActive?: boolean;
}

export interface GetTransactionResponse {
  successStatus: {
    total: number;
    items: any[];
  };
  succeeded: boolean;
  errors: any[];
}


export interface TransactionLine {
  accountId: string;
  debit: number;
  credit: number;
}

export interface CreateTransaction {
  date: string;
  referenceNo?: string;
  description: string;
  lines: TransactionLine[];
}

export interface UpdateTransaction {
  id: string;
  date: string;
  referenceNo?: string;
  description: string;
  lines: TransactionLine[];
}
export interface DeleteTransaction {
  id: string;
}
