import { CONFIG } from 'src/config-global';
import { DocumentsDetails } from 'src/sections/documents/view';

// ----------------------------------------------------------------------

export const metadata = { title: `View Document | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  return <DocumentsDetails documentId={id} />;
}