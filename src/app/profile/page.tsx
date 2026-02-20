'use client';

import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-80px)] p-8 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-black text-white mb-6">User Info<span className="text-cyan-400">_</span></h1>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Full Name</p>
              <p className="text-xl text-white font-bold">{user?.name}</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Email Address</p>
              <p className="text-xl text-white font-bold">{user?.email}</p>
            </div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Account Role</p>
            <p className="text-xl text-cyan-400 font-bold capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
