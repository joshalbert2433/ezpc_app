'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist, loading, user, addToCart, toggleWishlist } = useAuth();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="animate-pulse text-slate-500 font-black uppercase tracking-widest text-xs">Syncing saved components...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Your Wishlist<span className="text-cyan-400">_</span></h1>
          <p className="text-slate-500 mt-2">Saved components for your future dream build</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      {!user ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-20 text-center">
          <Heart size={48} className="mx-auto text-slate-800 mb-6" />
          <h2 className="text-2xl font-black text-white mb-4">Identity Verification Required</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">Please sign in to view and manage your saved system components.</p>
          <Link href="/login" className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-black transition-all">
            SIGN IN
          </Link>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-20 text-center">
          <Heart size={48} className="mx-auto text-slate-800 mb-6" />
          <h2 className="text-2xl font-black text-white mb-4">Wishlist is Empty</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">You haven't saved any components yet. Start exploring the catalog to build your list.</p>
          <Link href="/" className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-black transition-all">
            BROWSE COMPONENTS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const pid = product._id || product.id;
            return (
              <div key={pid} className="space-y-3 group relative">
                <ProductCard product={{...product, id: pid}} />
                <div className="flex gap-2">
                  <button 
                    onClick={() => addToCart(pid)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-cyan-500 hover:text-black text-slate-300 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    <Plus size={14} /> Add to Cart
                  </button>
                  <button 
                    onClick={() => toggleWishlist(pid)}
                    className="p-3 bg-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
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
