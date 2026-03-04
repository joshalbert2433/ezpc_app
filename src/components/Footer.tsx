// src/components/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Github, 
  Twitter, 
  Linkedin, 
  ShieldAlert, 
  ExternalLink,
  Terminal,
  Zap,
  Layers,
  Globe
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-(--card-border) bg-[var(--card)]/50 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--primary)]/40">
                <Cpu className="text-black dark:text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">EZPC<span className="text-[var(--primary)]">_</span>HUB</span>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-medium">
              Next-generation PC hardware procurement system. Engineering the future of custom computing through neural-link compatibility validation.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 bg-[var(--input)] rounded-lg text-[var(--muted)] hover:text-[var(--primary)] transition-all border border-(--card-border) hover:border-[var(--primary)]/30">
                <Github size={18} />
              </Link>
              <Link href="#" className="p-2 bg-[var(--input)] rounded-lg text-[var(--muted)] hover:text-[var(--primary)] transition-all border border-(--card-border) hover:border-[var(--primary)]/30">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="p-2 bg-[var(--input)] rounded-lg text-[var(--muted)] hover:text-[var(--primary)] transition-all border border-(--card-border) hover:border-[var(--primary)]/30">
                <Linkedin size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-6 flex items-center gap-2">
              <Terminal size={12} className="text-[var(--primary)]" /> System Directory
            </h4>
            <ul className="space-y-3">
              {['PC Builder', 'Hardware Catalog', 'Active Streams', 'User Dashboard', 'System Settings'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 group">
                    <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[var(--primary)]" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Infrastructure */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-6 flex items-center gap-2">
              <Layers size={12} className="text-[var(--primary)]" /> Infrastructure
            </h4>
            <ul className="space-y-3">
              {['Neural Compatibility', 'Uplink Support', 'Privacy Protocol', 'Service Terms', 'API Documentation'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 group">
                    <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[var(--primary)]" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Terminal Status */}
          <div className="bg-[var(--input)]/30 border border-(--card-border) p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={48} className="text-[var(--primary)]" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-4 flex items-center gap-2">
              <Globe size={12} className="text-[var(--primary)]" /> Network Status
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase">System Load</span>
                <span className="text-[10px] font-black text-green-500 uppercase">Optimal</span>
              </div>
              <div className="w-full bg-[var(--input)] h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[34%] animate-pulse" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Nodes Online</span>
                <span className="text-[10px] font-black text-[var(--foreground)] tracking-tighter">1,204 / 1,204</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="pt-8 border-t border-(--card-border)/50 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-3 px-6 py-3 bg-orange-500/5 border border-orange-500/20 rounded-2xl max-w-2xl">
            <ShieldAlert className="text-orange-500 shrink-0" size={20} />
            <p className="text-[11px] font-medium text-orange-500/80 leading-relaxed uppercase tracking-wide">
              <span className="font-black">Critical Disclaimer:</span> This platform is a non-commercial educational project. All hardware units, descriptions, values, and transaction simulations are strictly fictional and intended for portfolio demonstration only. No real orders are processed.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.1em]">
            <p>© 2026 EZPC HUB • Neural Hardware Systems • All rights reserved</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-[var(--primary)] transition-colors">Protocol v4.0.2</Link>
              <Link href="#" className="hover:text-[var(--primary)] transition-colors flex items-center gap-1.5">
                Developer Profile <ExternalLink size={10} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default Footer;
