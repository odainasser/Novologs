import { CONFIG } from 'src/config-global';

import { GroupDetails } from 'src/sections/client/view/group-details';

// ----------------------------------------------------------------------

export const metadata = { title: `Group Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  return <GroupDetails grpId={id} />;
}
