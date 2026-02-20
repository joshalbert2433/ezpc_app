// src/components/MainLayout.tsx
import React from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans">
      <Header />
      {children}
    </div>
  );
};

export default MainLayout;
