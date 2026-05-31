import { CONFIG } from 'src/config-global';

import { ProjectDetailsView } from 'src/sections/project/view';

// ----------------------------------------------------------------------

export const metadata = { title: `User profile | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ProjectDetailsView />;
}
