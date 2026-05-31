import { userEndpoints } from './userManage';
import { hierarchyEndpoints } from './hierarchy';
import { deptEndpoints } from './departments';
import { designationEndpoints } from './designations';
import { localizableEndpoints } from './localizable';
import { projectEndpoints } from './projects';
import { clientEndpoints } from './clients';
import { vendorEndpoints } from './vendors';
import { taskEndpoints } from './tasks';
import { settingsEndpoints } from './settings';
import { fileEndpoints } from './files';
import { documentEndpoints } from './documents';
import { timesheetEndpoints } from './timesheet';
import { chatEndpoints } from './chat';
import { ssoEndpoints } from './ssoLinks';
import { accountsEndpoints } from './accounts';
import { transactionEndpoints } from './transactions';
import { purchaseEndpoints } from './purchase';

export const apiEndpoints = {
  auth: {
    signIn: '/auth/login',
    forgotPassword: '/Users/forgotPassword', // TODO: no endpoint in new API yet
    resetPassword: '/Users/resetPassword', // TODO: no endpoint in new API yet
    chatBotStartSession: '/agent/api/v1/sessions',
    refreshToken: '/auth/refresh',
  },
  users: userEndpoints,
  hierarchy: hierarchyEndpoints,
  departments: deptEndpoints,
  designations: designationEndpoints,
  localizable: localizableEndpoints,
  projects: projectEndpoints,
  clients: clientEndpoints,
  vendors: vendorEndpoints,
  tasks: taskEndpoints,
  settings: settingsEndpoints,
  files: fileEndpoints,
  documents: documentEndpoints,
  timesheets: timesheetEndpoints,
  chat: chatEndpoints,
  ssoLinks: ssoEndpoints,
  accounts: accountsEndpoints,
  transactions: transactionEndpoints,
  purchase: purchaseEndpoints,
};
