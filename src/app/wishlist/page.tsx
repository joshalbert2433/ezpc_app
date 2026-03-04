'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist, loading, user, addToCart, toggleWishlist } = useAuth();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-[10px] text-black dark:text-white">Synchronizing Saved Units...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight text-black dark:text-white uppercase">Saved Hardware<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest mt-1">Staged components for future assembly</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all">
          <ArrowLeft size={14} /> Resume Search
        </Link>
      </div>

      {!user ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-16 text-center shadow-sm">
          <Heart size={40} className="mx-auto text-[var(--card-border)] mb-4" />
          <h2 className="text-xl font-black text-[var(--foreground)] mb-2 uppercase text-black dark:text-white">Identity Required</h2>
          <p className="text-xs text-[var(--muted)] max-w-xs mx-auto mb-6">Please authorize your session to access your saved hardware manifest.</p>
          <Link href="/login" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2.5 rounded-xl font-black transition-all text-xs uppercase tracking-widest">
            Authorize Session
          </Link>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-16 text-center shadow-sm">
          <Heart size={40} className="mx-auto text-[var(--card-border)] mb-4" />
          <h2 className="text-xl font-black text-[var(--foreground)] mb-2 uppercase text-black dark:text-white">Manifest Empty</h2>
          <p className="text-xs text-[var(--muted)] max-w-xs mx-auto mb-6">No hardware units staged in your current saved database.</p>
          <Link href="/" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2.5 rounded-xl font-black transition-all text-xs uppercase tracking-widest">
            Open Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {wishlist.map((product) => {
            const pid = product._id || product.id;
            return (
              <div key={pid} className="space-y-2 group relative">
                <ProductCard product={{...product, id: pid}} />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                  <button 
                    onClick={() => addToCart(pid)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-white dark:hover:text-black py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-[var(--primary)]/20"
                  >
                    <Plus size={12} /> Add to Cart
                  </button>
                  <button 
                    onClick={() => toggleWishlist(pid)}
                    className="p-2 bg-red-500/5 hover:bg-red-500 text-[var(--muted)] hover:text-white rounded-lg transition-all border border-red-500/10 hover:border-red-500"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
