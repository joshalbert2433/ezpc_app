'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Box, Users, Settings, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Admin logged out');
        window.location.href = '/login';
      }
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Box },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--card)] border-r border-(--card-border) flex flex-col z-50 transition-colors duration-300">
      <div className="p-8">
        <Link href="/" className="text-2xl font-black tracking-tighter text-[var(--primary)] hover:opacity-80 transition-opacity flex items-center gap-2">
          EZPC_ <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-1.5 py-0.5 rounded border border-[var(--primary)]/20">ADMIN</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-[var(--primary)] text-white dark:text-black font-bold shadow-lg shadow-[var(--primary)]/20' 
                  : 'text-[var(--muted)] hover:bg-[var(--input)] hover:text-[var(--foreground)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform duration-300 ${isActive ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-(--card-border)">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/5 rounded-xl transition-all font-bold"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
}
