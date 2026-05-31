'use client';

import { ClientListView } from './client-list-view';

// ----------------------------------------------------------------------

export function VendorMainList() {
  const isClientView = false;
  return <ClientListView isClientView={isClientView} />;
}
