'use client';

import React from 'react';
import { ShoppingBag, Users, Box, TrendingUp, AlertCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Sales', value: '$12,450', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Active Users', value: '142', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Products', value: '48', icon: Box, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending Orders', value: '7', icon: ShoppingBag, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  const recentActivity = [
    { id: 1, action: 'Product Soft-deleted', item: 'RTX 4090', time: '2 mins ago', icon: AlertCircle },
    { id: 2, action: 'New Order Received', item: '#ORD-9283', time: '1 hour ago', icon: ShoppingBag },
    { id: 3, action: 'New User Registered', item: 'John Doe', time: '5 hours ago', icon: Users },
    { id: 4, action: 'Product Price Updated', item: 'Ryzen 9 7950X', time: 'Yesterday', icon: Package },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-white">System Overview<span className="text-cyan-400">_</span></h1>
        <p className="text-slate-400 mt-1">Real-time stats and system performance</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-cyan-400" /> Recent Activity
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800/50 group hover:border-slate-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <activity.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.item}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-bold">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center animate-pulse">
            <Box size={40} />
          </div>
          <h2 className="text-2xl font-black text-white">Inventory Check</h2>
          <p className="text-slate-400 max-w-xs mx-auto">Quickly access and manage your product catalog with the new management system.</p>
          <Link 
            href="/admin/products" 
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-black transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Manage Products
          </Link>
        </div>
      </div>
    </div>
  );
}
