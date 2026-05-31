export const clientEndpoints = {
  getClients: '/client/getClients',
  addClient: '/client/addClient',
  updateClient: '/client/updateClient',
  deleteClient: '/client/deleteClient',

  getLeads: '/leads/getLeads',
  addLead: '/leads/addLead',
  updateLead: '/leads/updateLead',
  deleteLead: '/leads/deleteLead',
  changeLeadStatus: '/leads/changeLeadStatus',

  getSources: '/sources/getSources',
  addSource: '/sources/addSource',
  updateSource: '/sources/updateSource',
  deleteSource: '/sources/deleteSource',

  getSaleStatuses: '/saleStatuses/getSaleStatuses',
  addSaleStatus: '/saleStatuses/addSaleStatus',
  updateSaleStatus: '/saleStatuses/updateSaleStatus',
  deleteSaleStatus: '/saleStatuses/deleteSaleStatus',

  getRejectionReasons: '/rejectionReasons/getRejectionReasons',
  addRejectionReason: '/rejectionReasons/addRejectionReason',
  updateRejectionReason: '/rejectionReasons/updateRejectionReason',
  deleteRejectionReason: '/rejectionReasons/deleteRejectionReason',

  getSalesTargets: '/salesTargets/getSalesTargets',
  addSalesTarget: '/salesTargets/addSalesTarget',
  addSalesTargetList: '/salesTargets/addSalesTargetList',
  updateSalesTarget: '/salesTargets/updateSalesTarget',
  deleteSalesTargets: '/salesTargets/deleteSalesTargets',

  getContacts: '/contact/getContacts',
  addContact: '/contact/addContact',
  updateContact: '/contact/updateContact',
  deleteContact: '/contact/deleteContact',

  shareLeadMembers: '/leads/shareLeadWithMembers',

  getSharedLeads: '/leads/getSharedLeads',
  getLeadMemberByLeadId: '/leads/getLeadMembers',

  getLeadUpdates: '/leads/updates/getLeadUpdates',

  addLeadUpdate: '/leads/updates/addLeadUpdate',
  deleteLeadUpdate: '/leads/updates/deleteLeadUpdate',
};
