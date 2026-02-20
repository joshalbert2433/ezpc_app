// src/components/Header.tsx
'use client';

import { Search, ShoppingCart, Heart, User, Layers, LogOut, MapPin, User as UserIcon, Settings } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, loading, cart, wishlist } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Don't show public header on admin routes
  if (pathname.startsWith('/admin')) return null;

  const handleAuthRequired = (e: React.MouseEvent, path: string) => {
    if (!user) {
      e.preventDefault();
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Logged out successfully');
        window.location.href = '/login';
      }
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur-md border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <Link href="/" className="text-2xl font-black tracking-tighter text-cyan-400 hover:opacity-80 transition-opacity">EZPC_</Link>

        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search components (RTX 5090, Ryzen 9...)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-cyan-500 transition-colors text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <Link href="/builder" onClick={(e) => handleAuthRequired(e, '/builder')}>
            <Layers className="w-5 h-5 hover:text-cyan-400 cursor-pointer" title="PC Builder" />
          </Link>
          
          <Link href="/wishlist" onClick={(e) => handleAuthRequired(e, '/wishlist')} className="relative group">
            <Heart className={`w-5 h-5 transition-colors ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : 'group-hover:text-cyan-400'}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black px-1.5 rounded-full border border-dark shadow-lg animate-in fade-in zoom-in duration-300">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link href="/cart" onClick={(e) => handleAuthRequired(e, '/cart')} className="relative cursor-pointer group">
            <ShoppingCart className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-cyan-500 text-black text-[10px] font-black px-1.5 rounded-full border border-dark shadow-lg animate-in fade-in zoom-in duration-300">
                {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
              </span>
            )}
          </Link>
          
          <div className="relative" ref={dropdownRef}>
            {loading ? (
              <div className="w-5 h-5 bg-slate-800 rounded-full animate-pulse" />
            ) : user ? (
              <div 
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-sm font-medium hidden md:inline text-slate-300 group-hover:text-cyan-400 transition-colors">
                  {user.name}
                </span>
                <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border transition-all ${isDropdownOpen ? 'border-cyan-400' : 'border-slate-700 group-hover:border-cyan-400'}`}>
                  <User className={`w-4 h-4 ${isDropdownOpen ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 group">
                <User className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm font-medium hidden md:inline group-hover:text-cyan-400 transition-colors">Sign In</span>
              </Link>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && user && (
              <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs text-slate-500 truncate">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                </div>
                
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} /> Admin Dashboard
                  </Link>
                )}

                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <UserIcon size={16} /> User Info
                </Link>

                <Link 
                  href="/addresses" 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <MapPin size={16} /> Addresses
                </Link>

                <div className="h-px bg-slate-800 my-1"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
