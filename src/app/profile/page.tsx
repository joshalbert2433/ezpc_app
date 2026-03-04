'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Shield, 
  Zap, 
  Database, 
  Clock, 
  Key, 
  Fingerprint, 
  Activity,
  Package,
  Heart,
  Star,
  Terminal,
  ChevronRight,
  Monitor,
  Cpu,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, wishlist } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/user/orders');
        if (res.ok) {
          const data = await res.json();
          setOrderCount(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch user stats');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  const clearanceLevel = user?.role === 'admin' ? 'Level 5 - System Admin' : 'Level 2 - Field Engineer';
  const systemStatus = 'Optimal';

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-[var(--input)] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-(--card-border) opacity-20">
          <Fingerprint size={40} />
        </div>
        <h2 className="text-2xl font-black mb-4 text-[var(--foreground)] uppercase tracking-tighter">Biometric Authentication Required</h2>
        <p className="text-xs text-[var(--muted)] max-w-xs mx-auto mb-8 uppercase font-bold tracking-widest">Please authorize your session to access neural identity logs.</p>
        <Link href="/login" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all text-xs uppercase tracking-[0.2em]">
          EXECUTE UPLINK
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Identity Card */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl overflow-hidden shadow-sm relative group">
            {/* Aesthetic Tech Background */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[var(--primary)]/20 to-transparent opacity-50" />
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Cpu size={120} />
            </div>

            <div className="relative p-8 pt-16 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-3xl bg-[var(--input)] border-2 border-[var(--primary)]/30 flex items-center justify-center mb-6 relative group-hover:shadow-[0_0_20px_var(--primary)]/20 transition-all">
                <Fingerprint size={48} className="text-[var(--primary)]" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[var(--card)] flex items-center justify-center">
                  <Activity size={12} className="text-white animate-pulse" />
                </div>
              </div>

              <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tighter uppercase text-black dark:text-white leading-none mb-2">{user.name}</h1>
              <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-[0.3em] mb-6">{user.email}</p>

              <div className="w-full space-y-3">
                <div className="bg-[var(--input)]/50 rounded-2xl p-4 border border-(--card-border)">
                  <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Access Clearance</p>
                  <p className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">{clearanceLevel}</p>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1 bg-[var(--input)]/50 rounded-2xl p-3 border border-(--card-border)">
                    <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Uptime</p>
                    <p className="text-xs font-black text-black dark:text-white">1,402h</p>
                  </div>
                  <div className="flex-1 bg-[var(--input)]/50 rounded-2xl p-3 border border-(--card-border)">
                    <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xs font-black text-green-500 uppercase">Synced</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Neural Signature Visual (Aesthetic) */}
            <div className="border-t border-(--card-border) p-6 bg-[var(--input)]/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Neural Signature</span>
                <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest">Verified</span>
              </div>
              <div className="h-8 flex gap-0.5 items-end overflow-hidden opacity-40">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="bg-[var(--foreground)] w-1 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                ))}
              </div>
            </div>
          </div>

          <button className="w-full bg-[var(--input)] border border-(--card-border) hover:border-[var(--primary)] text-[var(--muted)] hover:text-[var(--primary)] py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2">
            <RefreshCw size={14} /> Synchronize Profile Data
          </button>
        </div>

        {/* Right Column: Systems & Logs */}
        <div className="lg:w-2/3 space-y-6">
          
          {/* Section: System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/profile/orders" className="bg-[var(--card)] border border-(--card-border) p-6 rounded-2xl hover:border-[var(--primary)]/50 transition-all shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Package size={20} />
                </div>
                <ChevronRight size={16} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-1">Procurement Cycles</p>
              <p className="text-3xl font-black text-black dark:text-white">{loading ? '...' : orderCount}</p>
            </Link>

            <Link href="/wishlist" className="bg-[var(--card)] border border-(--card-border) p-6 rounded-2xl hover:border-[var(--primary)]/50 transition-all shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
                  <Heart size={20} />
                </div>
                <ChevronRight size={16} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-1">Staged Components</p>
              <p className="text-3xl font-black text-black dark:text-white">{wishlist.length}</p>
            </Link>

            <div className="bg-[var(--card)] border border-(--card-border) p-6 rounded-2xl shadow-sm group cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                  <Star size={20} />
                </div>
              </div>
              <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-1">Neural Logs (Reviews)</p>
              <p className="text-3xl font-black text-black dark:text-white">4</p>
            </div>
          </div>

          {/* Section: Sub-systems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Details */}
            <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <Terminal size={18} className="text-[var(--primary)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)] text-black dark:text-white">Identity Details</h3>
              </div>
              
              <div className="space-y-6">
                <div className="border-b border-(--card-border) pb-4">
                  <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest mb-1.5">Official Name</p>
                  <p className="text-sm font-black text-black dark:text-white uppercase tracking-tight">{user.name}</p>
                </div>
                <div className="border-b border-(--card-border) pb-4">
                  <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest mb-1.5">Neural Address</p>
                  <p className="text-sm font-black text-black dark:text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest mb-1.5">Security Level</p>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-[var(--primary)]" />
                    <p className="text-sm font-black text-black dark:text-white uppercase tracking-tight">Protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Activity Log */}
            <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <Activity size={18} className="text-green-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)] text-black dark:text-white">Network Activity Log</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { action: 'Session Authorized', timestamp: '2 minutes ago', status: 'success' },
                  { action: 'Manifest Updated', timestamp: '1 hour ago', status: 'success' },
                  { action: 'Uplink Synchronized', timestamp: '4 hours ago', status: 'success' },
                  { action: 'Security Scan', timestamp: '1 day ago', status: 'success' }
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-tight">{log.action}</p>
                    </div>
                    <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors">{log.timestamp}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-[var(--input)]/30 border border-(--card-border) border-dashed rounded-2xl">
                <p className="text-[8px] font-medium text-[var(--muted)] leading-relaxed italic">
                  Neural activity is tracked for system stability and session authorization. All logs are encrypted using SHA-512 protocols.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Linked Terminals (Additional Connected Feature) */}
          <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <Monitor size={18} className="text-orange-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)] text-black dark:text-white">Authorized Terminals</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--input)]/50 border border-(--card-border) rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--card)] rounded-xl flex items-center justify-center border border-(--card-border)">
                  <Monitor size={20} className="text-[var(--muted)]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-black dark:text-white uppercase">Main Console</p>
                  <p className="text-[8px] font-bold text-[var(--muted)] uppercase">Win32-x64 • Active</p>
                </div>
              </div>
              
              <div className="p-4 bg-[var(--input)]/50 border border-(--card-border) rounded-2xl flex items-center gap-4 opacity-50">
                <div className="w-10 h-10 bg-[var(--card)] rounded-xl flex items-center justify-center border border-(--card-border)">
                  <Zap size={20} className="text-[var(--muted)]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-black dark:text-white uppercase">Mobile Unit</p>
                  <p className="text-[8px] font-bold text-[var(--muted)] uppercase">iOS-Neural • Offline</p>
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-(--card-border) rounded-2xl flex items-center justify-center cursor-pointer hover:border-[var(--primary)]/50 transition-all group">
                <span className="text-[8px] font-black text-[var(--muted)] group-hover:text-[var(--primary)] uppercase tracking-widest">+ Authorize Unit</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
