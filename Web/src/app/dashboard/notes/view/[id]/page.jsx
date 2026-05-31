import { CONFIG } from 'src/config-global';
import { DocumentsDetails } from 'src/sections/documents/view';

// ----------------------------------------------------------------------

export const metadata = { title: `View Note | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  const isTimeSheetView = true;

  return <DocumentsDetails documentId={id} isTimeSheetView={isTimeSheetView} />;
}
