'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Shield, 
  Package,
  Heart,
  Star,
  ChevronRight,
  Monitor,
  Activity,
  Camera,
  Mail,
  Calendar,
  Settings,
  LogOut,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, wishlist, refreshUser } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, activitiesRes, sessionsRes] = await Promise.all([
          fetch('/api/user/orders'),
          fetch('/api/user/activities'),
          fetch('/api/user/sessions')
        ]);
        
        if (ordersRes.ok) setOrderCount((await ordersRes.json()).length);
        if (activitiesRes.ok) setActivities(await activitiesRes.json());
        if (sessionsRes.ok) setSessions(await sessionsRes.json());
      } catch (err) {
        console.error('Failed to fetch user stats');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getOSInfo = (userAgent: string) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh')) return 'macOS';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone')) return 'iOS';
    return 'Unknown OS';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Profile picture updated', { id: toastId });
        await refreshUser();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to upload', { id: toastId });
      }
    } catch (err) {
      toast.error('Something went wrong', { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const accountRole = user?.role === 'admin' ? 'System Administrator' : 'Valued Customer';

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-[var(--input)] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-(--card-border) opacity-20">
          <User size={40} />
        </div>
        <h2 className="text-2xl font-black mb-4 text-[var(--foreground)] uppercase tracking-tighter">Login Required</h2>
        <p className="text-xs text-[var(--foreground-muted)] max-w-xs mx-auto mb-8 uppercase font-bold tracking-widest">Please sign in to access your profile and order history.</p>
        <Link href="/login" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all text-xs uppercase tracking-[0.2em]">
          SIGN IN
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl overflow-hidden shadow-sm relative group">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[var(--primary)]/20 to-transparent opacity-50" />
            
            <div className="relative p-8 pt-16 flex flex-col items-center text-center">
              {/* Profile Image with Upload Trigger */}
              <div className="relative group/avatar mb-6">
                <div className="w-32 h-32 rounded-3xl bg-[var(--input)] border-2 border-[var(--primary)]/30 overflow-hidden flex items-center justify-center relative transition-all group-hover/avatar:shadow-[0_0_20px_var(--primary)]/20">
                  {user.image ? (
                    <Image 
                      src={user.image} 
                      alt={user.name} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <User size={64} className="text-[var(--primary)]/40" />
                  )}
                  
                  {/* Upload Overlay */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 cursor-pointer"
                  >
                    <Camera size={24} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Change Photo</span>
                  </button>

                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <RefreshCw size={24} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[var(--card)] flex items-center justify-center">
                  <Activity size={12} className="text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none mb-2">{user.name}</h1>
              <p className="text-[10px] text-[var(--foreground-muted)] font-black uppercase tracking-[0.3em] mb-6">{user.email}</p>

              <div className="w-full space-y-3">
                <div className="bg-[var(--input)]/50 rounded-2xl p-4 border border-(--card-border)">
                  <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Account Role</p>
                  <p className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">{accountRole}</p>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1 bg-[var(--input)]/50 rounded-2xl p-3 border border-(--card-border)">
                    <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Member Status</p>
                    <p className="text-xs font-black text-green-500 uppercase">Active</p>
                  </div>
                  <div className="flex-1 bg-[var(--input)]/50 rounded-2xl p-3 border border-(--card-border)">
                    <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Verification</p>
                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest">Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />

            {/* Account Details Footer */}
            <div className="border-t border-(--card-border) p-6 bg-[var(--input)]/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">Profile Completion</span>
                <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest">90%</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--input)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => refreshUser()}
              className="bg-[var(--input)] border border-(--card-border) hover:border-[var(--primary)] text-[var(--foreground-muted)] hover:text-[var(--primary)] py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className="bg-[var(--input)] border border-(--card-border) hover:border-red-500/50 text-[var(--foreground-muted)] hover:text-red-500 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Right Column: Information & History */}
        <div className="lg:w-2/3 space-y-6">
          
          {/* Section: Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/profile/orders" className="bg-[var(--card)] border border-(--card-border) p-6 rounded-2xl hover:border-[var(--primary)]/50 transition-all shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Package size={20} />
                </div>
                <ChevronRight size={16} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] mb-1">My Orders</p>
              <p className="text-3xl font-black text-[var(--foreground)]">{loading ? '...' : orderCount}</p>
            </Link>

            <Link href="/wishlist" className="bg-[var(--card)] border border-(--card-border) p-6 rounded-2xl hover:border-[var(--primary)]/50 transition-all shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
                  <Heart size={20} />
                </div>
                <ChevronRight size={16} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] mb-1">Wishlist</p>
              <p className="text-3xl font-black text-[var(--foreground)]">{wishlist.length}</p>
            </Link>

            <div className="bg-[var(--card)] border border-(--card-border) p-6 rounded-2xl shadow-sm group cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                  <Star size={20} />
                </div>
              </div>
              <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] mb-1">Reviews Given</p>
              <p className="text-3xl font-black text-[var(--foreground)]">4</p>
            </div>
          </div>

          {/* Section: Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details */}
            <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <Settings size={18} className="text-[var(--primary)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Account Details</h3>
              </div>
              
              <div className="space-y-6">
                <div className="border-b border-(--card-border) pb-4 flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1.5">Full Name</p>
                    <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">{user.name}</p>
                  </div>
                  <button className="text-[8px] font-black text-[var(--primary)] uppercase hover:underline">Edit</button>
                </div>
                <div className="border-b border-(--card-border) pb-4 flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1.5">Email Address</p>
                    <p className="text-sm font-black text-[var(--foreground)]">{user.email}</p>
                  </div>
                  <Mail size={14} className="text-[var(--muted)]" />
                </div>
                <div className="pb-4 flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1.5">Password</p>
                    <p className="text-sm font-black text-[var(--foreground)]">••••••••••••</p>
                  </div>
                  <button className="text-[8px] font-black text-[var(--primary)] uppercase hover:underline">Change</button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <Activity size={18} className="text-green-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                {activities.length > 0 ? activities.map((log, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      <p className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-tight">{log.action}</p>
                    </div>
                    <span className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors">{formatTime(log.createdAt)}</span>
                  </div>
                )) : (
                  <p className="text-[10px] text-[var(--foreground-muted)] uppercase font-bold text-center py-4">No recent activity</p>
                )}
              </div>

              <div className="mt-8 p-4 bg-[var(--input)]/30 border border-(--card-border) border-dashed rounded-2xl">
                <p className="text-[8px] font-medium text-[var(--foreground-muted)] leading-relaxed italic">
                  We track account activity to help keep your information secure and your shopping experience seamless.
                </p>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <Monitor size={18} className="text-orange-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Active Sessions</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session, i) => (
                <div key={i} className={`p-4 bg-[var(--input)]/50 border ${session.isCurrent ? 'border-[var(--primary)]/50' : 'border-(--card-border)'} rounded-2xl flex items-center gap-4`}>
                  <div className="w-10 h-10 bg-[var(--card)] rounded-xl flex items-center justify-center border border-(--card-border)">
                    <Monitor size={20} className={session.isCurrent ? 'text-[var(--primary)]' : 'text-[var(--muted)]'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-[var(--foreground)] uppercase">{getBrowserInfo(session.userAgent)} on {getOSInfo(session.userAgent)}</p>
                      {session.isCurrent && <span className="text-[6px] bg-[var(--primary)]/20 text-[var(--primary)] px-1.5 py-0.5 rounded-full font-black uppercase">Now</span>}
                    </div>
                    <p className="text-[8px] font-bold text-[var(--foreground-muted)] uppercase">{session.ip} • {formatTime(session.lastActive)}</p>
                  </div>
                </div>
              ))}
              
              <div className="p-4 border-2 border-dashed border-(--card-border) rounded-2xl flex items-center justify-center cursor-pointer hover:border-[var(--primary)]/50 transition-all group">
                <span className="text-[8px] font-black text-[var(--foreground-muted)] group-hover:text-[var(--primary)] uppercase tracking-widest">Manage Sessions</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
