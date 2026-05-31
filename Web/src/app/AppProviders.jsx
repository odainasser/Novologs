'use client';

import React from 'react';
import FormErrorBoundary from 'src/sections/error/FormErrorBoundary';
import { ChatNotificationProvider } from 'src/app/chatNotificationProvider';
export default function AppProviders({ children }) {
  return (
    <FormErrorBoundary>
      <ChatNotificationProvider>{children}</ChatNotificationProvider>
    </FormErrorBoundary>
  );
}
