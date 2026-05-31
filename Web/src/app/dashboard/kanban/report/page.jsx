import { CONFIG } from 'src/config-global';

import { TaskReportingView } from 'src/sections/kanban/view/task-reporting-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Report |  ${CONFIG.appName}` };

export default function Page() {
  return <TaskReportingView />;
}
