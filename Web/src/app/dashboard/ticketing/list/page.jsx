import { CONFIG } from 'src/config-global';

import { TicketingMainList } from 'src/sections/project/view/ticket-main-list';

// ----------------------------------------------------------------------

export const metadata = { title: `Ticketing list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <TicketingMainList />;
}
