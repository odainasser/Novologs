import { CONFIG } from 'src/config-global';

import { JwtSignInView } from 'src/auth/view/jwt/jwt-sign-in-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign in | Jwt - ${CONFIG.appName}` };

export default function Page() {
  return <JwtSignInView />;
}
