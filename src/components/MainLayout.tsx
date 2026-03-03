// src/components/MainLayout.tsx
import React from 'react';
import Header from './Header';
import SupportChatWidget from './SupportChatWidget';

interface MainLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <Header />
      {children}
      <SupportChatWidget />
    </div>
  );
};

export default MainLayout;
