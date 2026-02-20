'use client';

import React, { useState } from 'react';
import { Trash2, ShoppingCart, ArrowLeft, Heart, Cpu } from 'lucide-react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import type { Product } from '@/types/product';

export default function WishlistPage() {
  // Mocking wishlist items from the products data
  const [wishlistItems, setWishlistItems] = useState<Product[]>(PRODUCTS.slice(2, 5));

  const removeFromWishlist = (id: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Heart className="w-16 h-16 text-slate-700 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4">Your wishlist is empty</h2>
        <p className="text-slate-400 mb-8">Save items you're interested in to track them here.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-cyan-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Explore Components
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black tracking-tight">My <span className="text-cyan-500">Wishlist</span></h1>
        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{wishlistItems.length} Saved Items</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map(item => (
          <div key={item.id} className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all duration-300 relative flex flex-col">
            {/* Product Link Area */}
            <Link href={`/product/${item.id}`} className="block mb-4">
              <div className="aspect-video bg-slate-800 rounded-lg mb-4 flex items-center justify-center group-hover:bg-slate-800/50 transition-colors relative overflow-hidden">
                <Cpu className="w-12 h-12 text-slate-700 group-hover:text-cyan-500/20 transition-all duration-500 group-hover:scale-110" />
                {item.badge && (
                  <span className="absolute top-2 left-2 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    {item.badge}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1">{item.name}</h3>
              <p className="text-xs text-slate-500 mb-2">{item.specs}</p>
              <span className="text-xl font-black text-cyan-400 block">${item.price.toLocaleString()}</span>
            </Link>

            {/* Actions */}
            <div className="mt-auto pt-4 border-t border-slate-800 flex gap-3">
              <button 
                className="flex-1 bg-slate-800 hover:bg-cyan-500 hover:text-black text-slate-200 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
                title="Add to Cart"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button 
                onClick={() => removeFromWishlist(item.id)}
                className="p-2 border border-slate-800 rounded-lg text-slate-500 hover:text-red-400 hover:border-red-400/30 transition-all"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
