'use client';

import { ClientListView } from './client-list-view';

// ----------------------------------------------------------------------

export function ClientMainList() {
  const isClientView = true;
  return <ClientListView isClientView={isClientView} />;
}
