import { CONFIG } from 'src/config-global';

import { SettingsView } from 'src/sections/settings/view/settings-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Settings | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <SettingsView />;
}
