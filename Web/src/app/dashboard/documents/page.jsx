import { CONFIG } from 'src/config-global';
import { DocumentView } from 'src/sections/documents/view';

export const metadata = { title: `Documents | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <DocumentView />;
}
