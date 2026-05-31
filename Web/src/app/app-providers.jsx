'use client';

import React from 'react';
import FormErrorBoundary from 'src/sections/error/form-error-boundary';
import { ChatNotificationProvider } from 'src/app/chat-notification-provider';
export default function AppProviders({ children }) {
  return (
    <FormErrorBoundary>
      <ChatNotificationProvider>{children}</ChatNotificationProvider>
    </FormErrorBoundary>
  );
}
