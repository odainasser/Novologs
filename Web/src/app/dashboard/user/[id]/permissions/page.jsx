import { CONFIG } from 'src/config-global';

import { UserRolesPermissionView } from 'src/sections/user/view/user-roles-permission-view';

// ----------------------------------------------------------------------

export const metadata = { title: `User Permissions | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  return <UserRolesPermissionView userId={id} />;
}
