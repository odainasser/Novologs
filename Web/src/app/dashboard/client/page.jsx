import { CONFIG } from 'src/config-global';

import { ClientProfileView } from 'src/sections/client/view/client-profile-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Client profile | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ClientProfileView />;
}
