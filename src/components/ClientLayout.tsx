'use client';

import React from 'react';
import MainLayout from './MainLayout';
import { SearchProvider, useSearch } from '../context/SearchContext';
import { AuthProvider } from '../context/AuthContext';
import ToasterProvider from './ToasterProvider';

function MainLayoutWithSearch({ children }: { children: React.ReactNode }) {
  const { searchQuery, setSearchQuery } = useSearch();
  
  return (
    <MainLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      {children}
    </MainLayout>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SearchProvider>
        <ToasterProvider />
        <MainLayoutWithSearch>
          {children}
        </MainLayoutWithSearch>
      </SearchProvider>
    </AuthProvider>
  );
}
