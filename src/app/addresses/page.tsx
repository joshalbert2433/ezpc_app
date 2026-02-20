'use client';

import { MapPin, Plus } from 'lucide-react';

export default function AddressesPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] p-8 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-white">Shipping Addresses<span className="text-cyan-400">_</span></h1>
          <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-bold transition-colors">
            <Plus size={18} /> Add New
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-cyan-500/30 relative">
            <span className="absolute top-4 right-4 bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-cyan-500/20">
              Default
            </span>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-lg">
                <MapPin className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Home</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  123 Cyberpunk Street, Neon District<br />
                  Metropolis, 10101<br />
                  Digital State
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-800 border-dashed text-center py-10">
            <p className="text-slate-500 italic">No other addresses found</p>
          </div>
        </div>
      </div>
    </div>
  );
}
