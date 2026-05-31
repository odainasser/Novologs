import { CONFIG } from 'src/config-global';

import { ClientDetails } from 'src/sections/client/view/client-details';

// ----------------------------------------------------------------------

export const metadata = { title: `Client Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  const isClientView = true;

  return <ClientDetails clientId={id} isClientView={isClientView} />;
}
