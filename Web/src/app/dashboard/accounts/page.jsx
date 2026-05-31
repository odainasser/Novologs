import { CONFIG } from 'src/config-global';

import { AccountsView } from 'src/sections/accounts/view/accounts-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Accounts | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AccountsView />;
}
