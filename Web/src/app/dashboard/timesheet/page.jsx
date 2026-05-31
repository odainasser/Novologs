import { CONFIG } from 'src/config-global';

import { TimesheetListView } from 'src/sections/timesheet/view/timesheet-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Timesheet | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <TimesheetListView />;
}
