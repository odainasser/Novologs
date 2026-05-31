import { CONFIG } from 'src/config-global';

import { MissionMainList } from 'src/sections/project/view/mission-main-list';

// ----------------------------------------------------------------------

export const metadata = { title: `Mission list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <MissionMainList />;
}
