import { CONFIG } from 'src/config-global';

import { ToDoListView } from 'src/sections/my-to-do/view/todo-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `My Activities | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ToDoListView />;
}
