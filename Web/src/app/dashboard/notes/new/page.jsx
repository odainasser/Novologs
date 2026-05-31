import { CONFIG } from 'src/config-global';

import AddMyNotes from 'src/sections/timesheet/view/add-my-notes';

export const metadata = { title: `Create New Note | Dashboard - ${CONFIG.appName}` };
export default function Page({ searchParams }) {
  return <AddMyNotes />;
}
