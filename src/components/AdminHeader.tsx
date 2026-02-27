'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, User, Menu } from 'lucide-react';

export default function AdminHeader() {
  const { user } = useAuth();
  
  return (
    <header className="h-20 border-b border-(--card-border) bg-[var(--background)]/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <button className="lg:hidden text-[var(--muted)]">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-3 bg-[var(--input)] border border-(--card-border) px-4 py-2 rounded-xl w-64 md:w-96 group focus-within:border-[var(--primary)] transition-all">
          <Search size={18} className="text-[var(--muted)] group-focus-within:text-[var(--primary)]" />
          <input 
            type="text" 
            placeholder="Search terminal..." 
            className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] w-full placeholder:text-[var(--muted)]" 
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-[var(--muted)] hover:text-[var(--primary)] bg-[var(--input)]/50 rounded-lg border border-(--card-border) hover:border-[var(--primary)]/30 transition-all group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--primary)] rounded-full border-2 border-[var(--background)] animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-4 pl-6 border-l border-(--card-border)">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-[var(--foreground)]">{user?.name}</p>
            <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Systems Admin</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shadow-lg shadow-[var(--primary)]/5">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
