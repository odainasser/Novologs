import { CONFIG } from 'src/config-global';

import { ProjectMainList } from 'src/sections/project/view/project-main-list';

// ----------------------------------------------------------------------

export const metadata = { title: `Project list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ProjectMainList />;
}
