import { CONFIG } from 'src/config-global';

import AddMyNotes from 'src/sections/timesheet/view/add-my-notes';
export const metadata = { title: `Edit Note | Dashboard - ${CONFIG.appName}` };

export default function Page({ searchParams, params }) {
  const { id } = params;

  return <AddMyNotes isEdit docId={id} />;
}
