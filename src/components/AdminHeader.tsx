'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, User, Menu } from 'lucide-react';

export default function AdminHeader() {
  const { user } = useAuth();
  
  return (
    <header className="h-20 border-b border-slate-800 bg-dark/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <button className="lg:hidden text-slate-400">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl w-64 md:w-96 group focus-within:border-cyan-500/50 transition-all">
          <Search size={18} className="text-slate-500 group-focus-within:text-cyan-400" />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-600" 
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-cyan-400 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-all group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border-2 border-dark animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-4 pl-6 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-white">{user?.name}</p>
            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/5">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
