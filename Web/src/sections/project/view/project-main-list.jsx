'use client';

import { ProjectListView } from './project-list-view';

// ----------------------------------------------------------------------

export function ProjectMainList() {
  const isMission = false;
  return <ProjectListView isMission={isMission} isTicket={false} />;
}
