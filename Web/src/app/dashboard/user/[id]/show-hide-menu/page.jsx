import { CONFIG } from 'src/config-global';

import { ShowHideMenu } from 'src/sections/settings/show-hide-menu';

// ----------------------------------------------------------------------

export const metadata = { title: `Show/Hide Menu | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  return <ShowHideMenu userId={id} />;
}
