export interface CreatePurchaseOrderItem {
  productId: number;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineDiscountType: number;
  lineDiscountValue: number;
  taxPercent: number;
}

export interface CreatePurchaseOrder {
  vendorId: number;
  currency: string;
  billingAddress: string;
  orderType: string;
  location: string;
  terms: string;
  purchaseDate: string;
  dueDate: string;
  ourRef: string;
  yourRef: string;
  overallDiscountType: number;
  overallDiscountValue: number;
  messageOnPurchase: string;
  items: CreatePurchaseOrderItem[];
}

export interface CreatePurchaseInvoice {
  vendorId: number;
  currency: string;
  billingAddress: string;
  invoiceType: string;
  location: string;
  terms: string;
  invoiceDate: string;
  dueDate: string;
  ourRef: string;
  yourRef: string;
  messageOnInvoice: string;
  debitAccountId: string;
  creditAccountId: string;
  purchaseOrderId: null;
  overallDiscountType: number;
  overallDiscountValue: number;
  items: CreatePurchaseOrderItem[];
}
export interface CreateDebitNote {
  vendorId: number;
  currency: string;
  billingAddress: string;
  invoiceType: string;
  location: string;
  terms: string;
  noteDate: string;
  dueDate: string;
  ourRef: string;
  yourRef: string;
  messageOnNote: string;
  debitAccountId: string;
  creditAccountId: string;
  purchaseInvoiceId: null;
  overallDiscountType: number;
  overallDiscountValue: number;
  items: CreatePurchaseOrderItem[];
}

export interface CreateSalesInvoice {
  clientId: number;
  currency: string;
  billingAddress: string;
  invoiceType: string;
  location: string;
  terms: string;
  invoiceDate: string;
  dueDate: string;
  ourRef: string;
  yourRef: string;
  messageOnInvoice: string;
  debitAccountId: string;
  creditAccountId: string;
  purchaseOrderId: null;
  overallDiscountType: number;
  overallDiscountValue: number;
  items: CreatePurchaseOrderItem[];
}

export interface UpdatePurchaseOrder {
  id: number;
  vendorId: number;
  currency: string;
  billingAddress: string;
  orderType: string;
  location: string;
  terms: string;
  purchaseDate: string;
  dueDate: string;
  ourRef: string;
  yourRef: string;
  messageOnPurchase: string;
  overallDiscountType: number;
  overallDiscountValue: number;
  items: CreatePurchaseOrderItem[];
}
export interface UpdatePurchaseInvoice {
  id: number;
  vendorId: number;
  currency: string;
  billingAddress: string;
  invoiceType: string;
  location: string;
  terms: string;
  invoiceDate: string;
  dueDate: string;
  ourRef: string;
  yourRef: string;
  messageOnInvoice: string;
  debitAccountId: string;
  creditAccountId: string;
  purchaseOrderId: null;
  overallDiscountType: number;
  overallDiscountValue: number;
  items: CreatePurchaseOrderItem[];
}
export interface UpdateDebitNote {
  id: number;
  vendorId: number;
  currency: string;
  billingAddress: string;
  invoiceType: string;
  location: string;
  terms: string;
  noteDate: string;
  dueDate: string;
  ourRef: string;
  yourRef: string;
  messageOnNote: string;
  debitAccountId: string;
  creditAccountId: string;
  purchaseInvoiceId: null;
  overallDiscountType: number;
  overallDiscountValue: number;
  items: CreatePurchaseOrderItem[];
}
export interface UpdateSalesInvoice {
  id: number;
  clientId: number;
  currency: string;
  billingAddress: string;
  invoiceType: string;
  location: string;
  terms: string;
  invoiceDate: string;
  dueDate: string;
  ourRef: string;
  yourRef: string;
  messageOnInvoice: string;
  debitAccountId: string;
  creditAccountId: string;
  purchaseOrderId: null;
  overallDiscountType: number;
  overallDiscountValue: number;
  items: CreatePurchaseOrderItem[];
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
export interface GetProductsPayload {
  search?: Filter;
  sort?: Sort;
  pagination: Pagination;
}

export interface GetPurchaseOrderPayload {
  search?: Filter;
  sort?: Sort;
  pagination: Pagination;
  vendorId?: string;
  status?: number;
  from?: string;
  to?: string;
}

export interface GetPurchaseInvoicePayload {
  search?: Filter;
  sort?: Sort;
  pagination: Pagination;
  vendorId?: string;
  status?: number;
  from?: string;
  to?: string;
  invoiceType?: number;
  purchaseOrderId?: number;
}
export interface GetSalesInvoicePayload {
  search?: Filter;
  sort?: Sort;
  pagination: Pagination;
  clientId?: string;
  status?: number;
  from?: string;
  to?: string;
  invoiceType?: number;
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
export interface ProductItem {
  id: string;
  name: Name;
}

export interface SuccessStatus {
  total: number;
  items: ProductItem[];
}

export interface GetProductsResponse {
  successStatus: SuccessStatus;
  succeeded: boolean;
  errors: any[];
}

export interface AddProduct {
  name: {
    id?: string;
    value: string;
    localizedStrings?: {
      id?: string;
      language: string;
      value: string;
    }[];
  };
  isActive: boolean;
  description?: string;
  unit?: string;
  taxPercentage?: number;
}

export interface UpdateProduct {
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
  isActive: boolean;
  description?: string;
  unit?: string;
  taxPercentage?: number;
}

export interface DeleteProduct {
  id: string;
}
export interface AddDefaultAccount {
  invoiceCategory: number;
  invoiceAccountRole: number;
  accountId: string;
}
export interface GetDebitNotePayload {
  search?: Filter;
  sort?: Sort;
  pagination: Pagination;
  vendorId?: string;
  status?: number;
  from?: string;
  to?: string;
  purchaseInvoiceId?: number;
}
