import { CONFIG } from 'src/config-global';
import { DocumentsAddNewPage } from 'src/sections/documents/view';

export const metadata = { title: `Create New Document | Dashboard - ${CONFIG.appName}` };
export default function Page({ searchParams }) {
  // searchParams will be an object like: { isProject: 'true', projectId: '123' }
  // Convert 'isProject' back to a boolean if needed, projectId will be a string.
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

  return (
    <DocumentsAddNewPage
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
    />
  );
}
