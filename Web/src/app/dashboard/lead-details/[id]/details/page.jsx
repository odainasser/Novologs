import { CONFIG } from 'src/config-global';

import { LeadDetails } from 'src/sections/client/view/lead-details';

// ----------------------------------------------------------------------

export const metadata = { title: `Lead Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  const isClientView = true;
  return <LeadDetails leadId={id} isClientView={isClientView} />;
}
