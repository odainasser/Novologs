import { CONFIG } from 'src/config-global';

import { SsoLoginView } from 'src/auth/view/jwt/sso-login-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign in | Jwt - ${CONFIG.appName}` };

export default function Page() {
  return <SsoLoginView />;
}
