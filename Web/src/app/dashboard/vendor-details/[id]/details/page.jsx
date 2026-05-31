import { CONFIG } from 'src/config-global';

import { ClientDetails } from 'src/sections/client/view/client-details';

// ----------------------------------------------------------------------

export const metadata = { title: `Vendor Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  const isClientView = false;
  return <ClientDetails clientId={id} isClientView={isClientView} />;
}
