export const accountsEndpoints = {
  getRootLevel: '/accounts/root',
  getHierarchyChart: '/accounts/chart',
  createAccounts: '/accounts',
  getAccounts: '/accounts/chart/list',
  updateAccount: '/accounts',
  deleteAccount: '/accounts',
  getAccountLookups: '/accounts/lookups',
  setOpeningBalance: '/accounts/opening-balance',
  getAccountById: (id: string) => `/account/accounts/${id}`,
};
