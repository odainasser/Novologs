import { CONFIG } from 'src/config-global';

import { ResetPassword } from 'src/auth/view/jwt/reset-password';

// ----------------------------------------------------------------------

export const metadata = { title: `Reset Password - ${CONFIG.appName}` };

export default function Page() {
  return <ResetPassword />;
}
