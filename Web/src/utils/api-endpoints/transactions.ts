export const transactionEndpoints = {
  getTransactions: '/transactions/list',
  createTransaction: '/transactions',
  updateTransaction: '/transactions',
  deleteTransaction: '/transactions',
  postTransaction: (id: number) => `/account/transactions/${id}/post`,
  getTransactionById: '/transactions',
};
