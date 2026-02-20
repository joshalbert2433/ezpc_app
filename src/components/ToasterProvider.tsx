'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: '#0f172a', // slate-900
          color: '#cbd5e1',     // slate-200
          border: '1px solid #1e293b', // slate-800
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#22d3ee',   // cyan-400
            secondary: '#0b0e14', // dark
          },
          style: {
            border: '1px solid rgba(34, 211, 238, 0.2)', // cyan-400 with opacity
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',   // red-500
            secondary: '#0b0e14', // dark
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.2)', // red-500 with opacity
          },
        },
      }}
    />
  );
}
