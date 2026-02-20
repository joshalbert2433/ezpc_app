'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: any) {
  return (
    <NextThemesProvider 
      attribute="data-theme" 
      defaultTheme="dark" 
      enableSystem={true}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
