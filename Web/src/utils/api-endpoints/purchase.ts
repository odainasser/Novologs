export const purchaseEndpoints = {
  getPurchaseOrder: '/purchase-orders/list',
  getPurchaseOrderById: (id: string) => `/account/purchase-orders/${id}`,

  deletePurchaseOrder: '/purchase-orders',

  createPurchaseOrder: '/purchase-orders',
  updatePurchaseOrder: '/purchase-orders',

  getProducts: '/products/list',
  createProduct: '/products',
  updateProduct: '/products',
  deleteProduct: '/products',

  getPurchaseOrderType: '/products/order-types/list',
  createPurchaseOrderType: '/products/order-types',
  updatePurchaseOrderType: '/products/order-types',
  deletePurchaseOrderType: '/products/order-types',

  getPurchaseTerms: '/products/terms/list',
  createPurchaseTerms: '/products/terms',
  updatePurchaseTerms: '/products/terms',
  deletePurchaseTerms: '/products/terms',

  getProductUnits: '/products/units/list',
  createProductUnits: '/products/units',
  updateProductUnits: '/products/units',
  deleteProductUnits: '/products/units',

  getPurchaseInvoice: '/purchase-invoices/list',
  getPurchaseInvoiceById: (id: string) => `/account/purchase-invoices/${id}`,

  deletePurchaseInvoice: '/purchase-invoices',

  createPurchaseInvoice: '/purchase-invoices',
  updatePurchaseInvoice: '/purchase-invoices',
  postPurchaseInvoice: (id: number) => `/account/purchase-invoices/${id}/post`,

  getSalesInvoice: '/sales-invoices/list',
  getSalesInvoiceById: (id: string) => `/account/sales-invoices/${id}`,

  deleteSalesInvoice: '/sales-invoices',

  createSalesInvoice: '/sales-invoices',
  updateSalesInvoice: '/sales-invoices',
  postSalesInvoice: (id: number) => `/account/sales-invoices/${id}/post`,

  getDefaultAccounts: '/invoice-default-accounts/list',
  createDefaultAccount: '/invoice-default-accounts',
  deleteDefaultAccount: '/invoice-default-accounts',
  getDebitNotePrefillByPurchaseInvoiceId: (id: string) => `/account/debit-notes/prefill/${id}`,

  getDebitNote: '/debit-notes/list',
  getDebitNoteById: (id: string) => `/account/debit-notes/${id}`,
  deleteDebitNote: '/debit-notes',
  createDebitNote: '/debit-notes',
  updateDebitNote: '/debit-notes',
  postDebitNote: (id: number) => `/account/debit-notes/${id}/post`,
};
