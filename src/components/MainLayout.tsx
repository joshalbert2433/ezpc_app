import React from 'react';
import Header from './Header';
import SupportChatWidget from './SupportChatWidget';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <SupportChatWidget />
    </div>
  );
};

export default MainLayout;
