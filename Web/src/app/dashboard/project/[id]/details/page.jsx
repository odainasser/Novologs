import { CONFIG } from 'src/config-global';

import { ProjectDetailsView } from 'src/sections/project/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Project Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  return <ProjectDetailsView projectId={id} />;
}
