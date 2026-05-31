export interface RootLevel {
  id: string;
  code: string;
  name: string;
  accountType: number;
  accountCategory: number;
  level: number;
  parentAccountId: string | null;
  parentName: string | null;
  fullPath: string;
  hasChildren: boolean;
  isActive: boolean;
  created: string;
}
export interface GetRootLevel {
  successStatus: RootLevel[];
  succeeded: boolean;
  errors: any[];
  __error?: boolean;
  message?: string;
}
export interface AccountHierarchyNode {
  id: string;
  code: string;
  name: string;
  accountType: number;
  accountCategory: number;
  level: number;
  parentAccountId: string | null;
  isActive: boolean;
  children: AccountHierarchyNode[];
}
export interface GetHierarchyChartResponse {
  successStatus: AccountHierarchyNode[];
  succeeded: boolean;
  errors: any[];
  __error?: boolean;
  message?: string;
}
export interface CreateAccounts {
  name: string;
  accountType: number;
  accountCategory: number;
  parentAccountId: string;
  isSubcategory?: boolean;
}

export interface UpdateAccounts {
  name: string;
  accountType: number;
  accountCategory: number;
  parentAccountId: string;
  isActive?: boolean;
}
export interface SetOpeningBalance {
  accountId: string;
  openingDebit: number;
  openingCredit: number;
}

export interface OpeningBalancePayload {
  entries: SetOpeningBalance[];
}
export interface SetOpeningBalance {
  accountId: string;
  openingDebit: number;
  openingCredit: number;
}

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
export interface GetAccountsPayload {
  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;
  accountType?: number;
  accountCategory?: number;
  isActive?: boolean;
}

export interface GetAccountsResponse {
  successStatus: {
    total: number;
    items: Accounts[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Accounts {
  id: string;
  code: string;
  name: string;
  accountType: number;
  accountCategory: number;
  level: number;
  parentAccountId: string | null;
  parentName: string | null;
  fullPath: string;
  level1Name: string | null;
  level2Name: string | null;
  level3Name: string | null;
  level4Name: string | null;
  level5Name: string | null;
  hasChildren: boolean;
  isActive: boolean;
  created: string;
}

export interface DeleteAccount {
  id: string;
}
