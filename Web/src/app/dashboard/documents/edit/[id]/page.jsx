import { CONFIG } from 'src/config-global';

import { DocumentsAddNewPage } from 'src/sections/documents/view';

export const metadata = { title: `Edit Document | Dashboard - ${CONFIG.appName}` };

export default function Page({ searchParams, params }) {
  const isProject = searchParams?.isProject === 'true';
  const projectId = searchParams?.projectId;

  const isClient = searchParams?.isClient === 'true';
  const clientId = searchParams?.clientId;

  const isVendor = searchParams?.isVendor === 'true';
  const vendorId = searchParams?.vendorId;

  const isLead = searchParams?.isLead === 'true';
  const leadId = searchParams?.leadId;

  const isContract = searchParams?.isContract === 'true';
  const contractId = searchParams?.contractId;
  const { id } = params;

  // ✅ Pass it to the reusable add/edit page
  return (
    <DocumentsAddNewPage
      isEdit
      isProject={isProject}
      projectId={projectId}
      isClient={isClient}
      clientId={clientId}
      isLead={isLead}
      leadId={leadId}
      isVendor={isVendor}
      vendorId={vendorId}
      isContract={isContract}
      contractId={contractId}
      docId={id}
    />
  );
}
