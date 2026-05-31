// import { HomeView } from 'src/sections/home/view';

import { redirect } from 'next/navigation';
import { CONFIG } from 'src/config-global';

export const metadata = {
  title: 'Novologs',
};

export default function Page() {
  // return <HomeView />;
  redirect(CONFIG.auth.redirectPath);
}
