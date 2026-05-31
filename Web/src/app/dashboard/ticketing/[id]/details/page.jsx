import { CONFIG } from 'src/config-global';

import { ProjectDetailsView } from 'src/sections/project/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Ticket Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  const isTicket = true;
  return <ProjectDetailsView projectId={id} isTicket={isTicket} />;
}
