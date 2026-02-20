// src/components/Header.tsx
'use client';

import { Search, ShoppingCart, Heart, User, Layers, LogOut, MapPin, User as UserIcon, Settings } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

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
    <header className="sticky top-0 z-50 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--card-border)] px-6 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <Link href="/" className="text-2xl font-black tracking-tighter text-[var(--primary)] hover:opacity-80 transition-opacity">EZPC_</Link>

        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input 
            type="text"
            placeholder="Search components (RTX 5090, Ryzen 9...)"
            className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[var(--primary)] transition-all text-[var(--foreground)] placeholder:text-[var(--muted)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6 text-[var(--muted)]">
          <Link href="/builder" onClick={(e) => handleAuthRequired(e, '/builder')}>
            <Layers className="w-5 h-5 hover:text-[var(--primary)] cursor-pointer transition-colors" title="PC Builder" />
          </Link>
          
          <Link href="/wishlist" onClick={(e) => handleAuthRequired(e, '/wishlist')} className="relative group">
            <Heart className={`w-5 h-5 transition-colors ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : 'group-hover:text-[var(--primary)]'}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black px-1.5 rounded-full border border-[var(--card-border)] shadow-lg animate-in fade-in zoom-in duration-300">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link href="/cart" onClick={(e) => handleAuthRequired(e, '/cart')} className="relative cursor-pointer group">
            <ShoppingCart className="w-5 h-5 group-hover:text-[var(--primary)] transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--primary)] text-white dark:text-black text-[10px] font-black px-1.5 rounded-full border border-[var(--card-border)] shadow-lg animate-in fade-in zoom-in duration-300">
                {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
              </span>
            )}
          </Link>
          
          <div className="h-6 w-px bg-[var(--card-border)] mx-1 hidden md:block" />

          <ThemeToggle />
          
          <div className="relative" ref={dropdownRef}>
            {loading ? (
              <div className="w-5 h-5 bg-[var(--input)] rounded-full animate-pulse" />
            ) : user ? (
              <div 
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-sm font-bold hidden md:inline text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {user.name}
                </span>
                <div className={`w-9 h-9 rounded-xl bg-[var(--input)] flex items-center justify-center border transition-all ${isDropdownOpen ? 'border-[var(--primary)] shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-[var(--card-border)] group-hover:border-[var(--primary)]'}`}>
                  <User className={`w-4 h-4 ${isDropdownOpen ? 'text-[var(--primary)]' : 'text-[var(--muted)] group-hover:text-[var(--primary)]'}`} />
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 group">
                <User className="w-5 h-5 group-hover:text-[var(--primary)] transition-colors text-[var(--muted)]" />
                <span className="text-xs font-black uppercase tracking-widest hidden md:inline group-hover:text-[var(--primary)] transition-colors text-[var(--foreground)]">Sign In</span>
              </Link>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && user && (
              <div className="absolute right-0 mt-3 w-56 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200 backdrop-blur-xl">
                <div className="px-4 py-3 border-b border-[var(--card-border)] mb-1">
                  <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">Operator Session</p>
                  <p className="text-sm font-bold text-[var(--foreground)] truncate mt-0.5">{user.email}</p>
                </div>
                
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--input)] hover:text-[var(--primary)] transition-all font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} /> Admin Terminal
                  </Link>
                )}

                <Link 
                  href="/profile" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--input)] hover:text-[var(--primary)] transition-all font-medium"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <UserIcon size={16} /> Profile Details
                </Link>

                <Link 
                  href="/addresses" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--input)] hover:text-[var(--primary)] transition-all font-medium"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <MapPin size={16} /> Logistic Points
                </Link>

                <div className="h-px bg-[var(--card-border)] my-1"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-all font-bold"
                >
                  <LogOut size={16} /> Terminate Session
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
