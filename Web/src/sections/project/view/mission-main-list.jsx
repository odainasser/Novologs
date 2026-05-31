'use client';

import { ProjectListView } from './project-list-view';

// ----------------------------------------------------------------------

export function MissionMainList() {
  const isMission = true;
  return <ProjectListView isMission={isMission} isTicket={false} />;
}
