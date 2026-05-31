import { CONFIG } from 'src/config-global';

import { WorkflowFileView } from 'src/sections/project/view/workflow-file-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Workflow - ${CONFIG.appName}` };

export default function Page() {
  const isMainView = true;
  return <WorkflowFileView isMainView={isMainView} />;
}
