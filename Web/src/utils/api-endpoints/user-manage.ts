export const userEndpoints = {
  getInfo: '/Users/manage/info',
  getUser: '/Users/manage/getUser',
  getAllRoles: '/Users/manage/getAllRoles',
  getUserById: '/Users/manage/getUser',
  getUserStatistics: '/Statistics/UserStatistic',
  getAdminStatistics: '/Statistics/AdminStatistic',

  addUser: '/Users/settings/addUser',
  updateUser: '/Users/settings/updateUser',
  deleteUser: '/Users/settings/deleteUser',
  deactivateUser: '/Users/settings/activateDeactivateUser',
  resendEmail: '/Users/settings/resendActivationEmail',

  confirmEmail: '/Users/confirmEmail',
  confirmEmailSetPassword: '/Users/confirmEmailSetPassword',

  changePassword: '/Users/changePassword',

  getWorkStatuses: '/workstatuses/getWorkStatuses',
  addWorkStatus: '/workstatuses/addWorkStatus',
  updateWorkStatus: '/workstatuses/updateWorkStatus',
  deleteWorkStatus: '/workstatuses/deleteWorkStatus',
  changeMyWorkStatus: '/workstatuses/changeMyWorkStatus',

  getUserGroups: '/userGroups/getUserGroups',
  addUserGroup: '/userGroups/addUserGroup',
  updateUserGroup: '/userGroups/updateUserGroup',
  deleteUserGroup: '/userGroups/deleteUserGroup',

  getNotifications: '/manage/getNotification',
  setNotificationIsRead: '/manage/setNotificationIsRead',
  clearNotification: '/manage/clearNotification',

  getPermissionList: '/manage/getPermissionList',
  assignPermissionToUser: '/manage/assignPermissionToUser',
  getAllUserRoles: '/manage/getRole',
  addRole: '/manage/addRole',
  addDescriptionToPermission: '/manage/addDescriptionToPermission',
  deleteRole: '/manage/deleteRole',
  assignPermissionToRole: '/manage/assignPermissionToRole',
  updateRolePermission: '/manage/updateRolePermission',
  unassignPermissionToRole: '/manage/unassignPermissionToRole',
  updateUserPermission: '/manage/updateUserPermission',
  getUsersWithPermission: '/manage/getUsersWithPermission',
  unassignPermissionToUser: '/manage/unassignPermissionToUser',
  getCompanyBranches: '/manage/getCompanyBranches',
  addCompanyBranch: '/manage/addCompanyBranch',
  updateCompanyBranch: '/manage/updateCompanyBranch',
  deleteCompanyBranch: '/manage/deleteCompanyBranch',

  tenantInfo: '/Tenant/info',
  getAuditLogs: '/manage/getAuditLogs',
};
