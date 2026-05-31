'use client';

import { ProjectListView } from './project-list-view';

// ----------------------------------------------------------------------

export function TicketingMainList() {
  const isMission = false;
  const isTicket = true;
  return <ProjectListView isMission={isMission} isTicket={isTicket} />;
}
