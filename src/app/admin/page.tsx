'use client';

import React from 'react';
import { ShoppingBag, Users, Box, TrendingUp, AlertCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Sales', value: '$12,450', icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Active Users', value: '142', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Products', value: '48', icon: Box, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Orders', value: '7', icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const recentActivity = [
    { id: 1, action: 'Product Soft-deleted', item: 'RTX 4090', time: '2 mins ago', icon: AlertCircle },
    { id: 2, action: 'New Order Received', item: '#ORD-9283', time: '1 hour ago', icon: ShoppingBag },
    { id: 3, action: 'New User Registered', item: 'John Doe', time: '5 hours ago', icon: Users },
    { id: 4, action: 'Product Price Updated', item: 'Ryzen 9 7950X', time: 'Yesterday', icon: Package },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 transition-colors duration-300">
      <header>
        <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter">System Overview<span className="text-[var(--primary)]">_</span></h1>
        <p className="text-[var(--muted)] mt-1 font-medium">Real-time stats and network performance</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[var(--card)] border border-(--card-border) p-6 rounded-2xl hover:border-[var(--primary)]/30 transition-all group shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-[var(--foreground)] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[var(--foreground)] flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp size={20} className="text-[var(--primary)]" /> Recent Activity
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-[var(--input)]/50 rounded-xl border border-(--card-border) group hover:border-[var(--primary)]/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--card)] border border-(--card-border) rounded-lg flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">
                    <activity.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">{activity.action}</p>
                    <p className="text-xs text-[var(--muted)]">{activity.item}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--muted)] font-black uppercase">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-[var(--primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center animate-pulse z-10">
            <Box size={40} />
          </div>
          <h2 className="text-2xl font-black text-[var(--foreground)] z-10">Inventory Management</h2>
          <p className="text-[var(--muted)] max-w-xs mx-auto z-10 font-medium text-sm">Quickly access and manage your product catalog with the centralized management system.</p>
          <Link 
            href="/admin/products" 
            className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all shadow-lg z-10 active:scale-95 text-xs uppercase tracking-widest"
          >
            Manage Products
          </Link>
        </div>
      </div>
    </div>
  );
}
