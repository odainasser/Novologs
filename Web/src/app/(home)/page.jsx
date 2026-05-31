import { redirect } from 'next/navigation';

import { CONFIG } from 'src/config-global';

export const metadata = {
  title: 'Novologs',
};

export default function Page() {
  redirect(CONFIG.auth.redirectPath);
}
