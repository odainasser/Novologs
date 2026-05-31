import { CONFIG } from 'src/config-global';

import { UserProfileView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata = { title: `User profile | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  return <UserProfileView userId={id} />;
}
