import { CONFIG } from 'src/config-global';

import { AdminPanel } from 'src/sections/overview/app/view/admin-panel';

// ----------------------------------------------------------------------

export const metadata = { title: `Admin Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const isAdmin = true;
  return <AdminPanel isAdmin={isAdmin} />;
}
