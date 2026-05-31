export interface GetClientPayload {
  search?: {
    fieldName: string;
    fieldValue: string;
    operator?: number;
    logicOperator?: number;
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

export interface GetLeadPayload {
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
  clientId?: string;
  myLeads?: boolean;
}

export interface GetLeadUpdatesPayload {
  search?: {
    fieldName: string;
    fieldValue: string;
    operator?: number;
    logicOperator?: number;
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
  leadId?: string;
}
export interface GetContractPayload {
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
  vendorId: string;
}
export interface LocalizedString {
  value: string;
  localizedStrings: any[];
  created: string;
  createdBy: string | null;
  lastModified: string;
  lastModifiedBy: string | null;
}

export interface User {
  id: string;
  serial: number;
  code: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  country: string;
  language: string;
  userType: number;
  designationId: string;
  level: number;
  parentName: string | null;
  parentId: string | null;
  designationName: LocalizedString;
  departmentId: string;
  departmentName: LocalizedString;
  created: string;
  createdBy: string | null;
  lastModified: string;
  lastModifiedBy: string | null;
}

export interface Clients {
  code: string;
  serial: number;
  name: string;
  website: string;
  address: string;
  email: string;
  phonenumber: string;
  emirate: string;
  locationLatitude: number;
  locationLongitude: number;
  creatorId: string;
  creator: User;
  created: string;
  createdBy: string;
  lastModified: string;
  lastModifiedBy: string;
}

export interface GetClientResponse {
  successStatus: {
    total: number;
    items: Clients[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface CreateClient {
  name: string;
  code?: string;
  website?: string;
  address?: string;
  email?: string;
  phonenumber?: string;
  emirate?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  logoFileId?: string;
  isAccount?: boolean;
}

export interface UpdateClient {
  id: string;
  name: string;
  code?: string;
  website?: string;
  address?: string;
  email?: string;
  phonenumber?: string;
  emirate?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  logoFileId?: string;
  isAccount?: boolean;
}

export interface DeleteClient {
  id: string;
}

export interface AddLead {
  code: string;
  name: string;
  clientId: string;
  saleStatusId: string;
  leadSourceId?: string;
  value?: number;
  currencyId?: string;
  expectedAwardedDate?: string;
  probability?: number;
}

export interface UpdateLead {
  id: string;
  code: string;
  name: string;
  clientId: string;
  saleStatusId: string;
  leadSourceId?: string;
  value?: number;
  currencyId?: string;
  expectedAwardedDate?: string;
  probability?: number;
}

export interface ChangeLeadStatus {
  id: string;
  leadStatus: string;
  awardedValue?: string;
  awardedCurrencyId?: string;
  awardedDate?: string;
  rejectedDate?: string;
  rejectionReasonId?: string;
}

export interface AddContract {
  code: string;
  name: string;
  vendorId: string;
  description?: string;
  vendorContractStatusId?: string;
  vendorContractTypeId?: string;
  value?: number;
  currencyId?: string;
  expectedStartDate?: string;
  expectedEndDate?: string;
}
export interface UpdateContract {
  id: string;
  code: string;
  name: string;
  vendorId: string;
  description?: string;
  vendorContractStatusId?: string;
  vendorContractTypeId?: string;
  value?: number;
  currencyId?: string;
  expectedStartDate?: string;
  expectedEndDate?: string;
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

export interface SourceItem {
  id: string;
  nameId: string;
  name: Name;
}

export interface SuccessStatus {
  total: number;
  items: SourceItem[];
}

export interface GetSourceResponse {
  successStatus: SuccessStatus;
  succeeded: boolean;
  errors: any[];
}

export interface AddSource {
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

export interface UpdateSource {
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

export interface DeleteSource {
  id: string;
}

export interface GetSalesReportPayload {
  userId: string;
  year: string;
}

export interface GetSalesReportResponse {
  successStatus: {
    total: number;
    items: SalesReport[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface SalesReport {
  id: string | null;
  date: string;
  value: number;
  achivedValue: number;
  userId: string;
}

export interface AddSalesTarget {
  targets: {
    date: string;
    value: number;
  }[];
  userId: string;
}

export interface CreateClientContact {
  name: string;
  email: string;
  clientId?: number;
  vendorId?: number;
  mobileNumber?: string;
  phoneNumber?: string;
  designation?: string;
}

export interface UpdateClientContact {
  id: string;
  name: string;
  email: string;
  clientId?: number;
  vendorId?: number;
  mobileNumber?: string;
  phoneNumber?: string;
  designation?: string;
}
export interface AddLeadMembers {
  leadId: string;
  members: LeadMember[];
}

export interface LeadMember {
  memberId: string;
}
export interface AddLeadUpdate {
  leadId: string;
  description: string;
  status: string;
}
