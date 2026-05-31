// ----------------------------------------------------------------------

export const metadata = {
  title: 'Getting Started - NovoTak Support',
  description: 'Step-by-step guide to get started with NovoTak',
};

export default function GettingStartedLayout({ children }) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white' }}>
      {children}
    </div>
  );
}

