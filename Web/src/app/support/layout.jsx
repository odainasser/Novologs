import { SupportLayout } from './components/support-layout';
import { BackToTopWrapper } from './components/back-to-top-wrapper';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'NovoTak Help & Support Center',
  description: 'Learn how to use NovoTak effectively across web and mobile platforms. Get step-by-step guides for all modules and features.',
  keywords: 'NovoTak, help, support, guide, tutorial, web dashboard, mobile app, project management',
};

export default function Layout({ children }) {
  return (
    <SupportLayout>
      {children}
      <BackToTopWrapper />
    </SupportLayout>
  );
}

