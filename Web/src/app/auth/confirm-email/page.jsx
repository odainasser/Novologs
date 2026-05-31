import { CONFIG } from 'src/config-global';

import { SetPassword } from 'src/auth/view/jwt/set-password';

// ----------------------------------------------------------------------

export const metadata = { title: `Confirm Email - ${CONFIG.appName}` };

export default function Page() {
  return <SetPassword />;
}
