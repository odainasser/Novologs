import { CONFIG } from 'src/config-global';

import { ClientMainList } from 'src/sections/client/view/client-main-list';

// ----------------------------------------------------------------------

export const metadata = { title: `Client list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ClientMainList />;
}
