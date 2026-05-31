import { CONFIG } from 'src/config-global';

import { KanbanListView } from 'src/sections/kanban/view/kanban-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Task list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <KanbanListView />;
}
