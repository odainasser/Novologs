import { CONFIG } from 'src/config-global';

import { LeadDetails } from 'src/sections/client/view/lead-details';

// ----------------------------------------------------------------------

export const metadata = { title: `Contract Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  const isClientView = false;
  return <LeadDetails leadId={id} isClientView={isClientView} />;
}
