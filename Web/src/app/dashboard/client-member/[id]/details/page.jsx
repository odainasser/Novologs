import { CONFIG } from 'src/config-global';

import { MemberDetails } from 'src/sections/client/view/member-details';

// ----------------------------------------------------------------------

export const metadata = { title: `Member Sales Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  return <MemberDetails memberId={id} />;
}
