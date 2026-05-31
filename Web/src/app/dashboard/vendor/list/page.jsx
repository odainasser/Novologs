import { CONFIG } from 'src/config-global';

import { VendorMainList } from 'src/sections/client/view/vendor-main-list';

// ----------------------------------------------------------------------

export const metadata = { title: `Vendor list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <VendorMainList />;
}
