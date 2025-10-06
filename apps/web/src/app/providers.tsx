'use client';

import { ReactNode } from 'react';
import { AppProvider } from '../state/AppContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}

