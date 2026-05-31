import { CONFIG } from 'src/config-global';

import { TaskDetails } from 'src/sections/kanban/details/task-details';

// ----------------------------------------------------------------------

export const metadata = { title: `Task Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  return <TaskDetails taskId={id} />;
}
