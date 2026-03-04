'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, Package, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, loading, user, addToCart, removeFromCart } = useAuth();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const router = useRouter();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Select all items by default only on first load
    if (!isInitialized && cart.length > 0) {
      setSelectedItemIds(cart.map(item => item.product?._id || '').filter(Boolean));
      setIsInitialized(true);
    }
  }, [cart, isInitialized]);

  const handleRemoveItem = async (productId: string) => {
    await removeFromCart(productId);
    // Remove from selection if it was selected
    setSelectedItemIds(prev => prev.filter(id => id !== productId));
  };

  const handleCheckboxChange = (productId: string, isChecked: boolean) => {
    setSelectedItemIds(prev => 
      isChecked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAllChange = (isChecked: boolean) => {
    setSelectedItemIds(isChecked ? cart.map(item => item.product?._id || '').filter(Boolean) : []);
  };

  const selectedItems = cart.filter(item => item.product && selectedItemIds.includes(item.product._id));

  const subtotal = selectedItems.reduce((acc, curr) => acc + ((curr.product?.price || 0) * curr.quantity), 0);
  const tax = subtotal * 0.05; // 5% example tax
  const total = subtotal + tax;

  const goToProduct = (product_id : string) => {
    router.push(`/product/${product_id}`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-[10px]">Syncing Cart...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight text-black dark:text-white uppercase">Cart Manifest<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest mt-1">System Verification Stage</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all">
          <ArrowLeft size={14} /> Resume Search
        </Link>
      </div>

      {!user ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-16 text-center shadow-sm">
          <ShoppingCart size={40} className="mx-auto text-[var(--card-border)] mb-4" />
          <h2 className="text-xl font-black text-[var(--foreground)] mb-2 uppercase text-black dark:text-white">Uplink Required</h2>
          <p className="text-xs text-[var(--muted)] max-w-xs mx-auto mb-6">Authorize your session to synchronize your cart manifest.</p>
          <Link href="/login" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2.5 rounded-xl font-black transition-all text-xs uppercase tracking-widest">
            Authorize Session
          </Link>
        </div>
      ) : cart.length === 0 ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-16 text-center shadow-sm">
          <ShoppingCart size={40} className="mx-auto text-[var(--card-border)] mb-4" />
          <h2 className="text-xl font-black text-[var(--foreground)] mb-2 uppercase text-black dark:text-white">Manifest Empty</h2>
          <p className="text-xs text-[var(--muted)] max-w-xs mx-auto mb-6">No hardware units detected in your current synchronization cycle.</p>
          <Link href="/" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2.5 rounded-xl font-black transition-all text-xs uppercase tracking-widest">
            Open Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-[var(--card)] border border-(--card-border) rounded-xl p-3 flex items-center justify-between shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => handleSelectAllChange(selectedItemIds.length !== cart.length)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedItemIds.length === cart.length ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-(--card-border) bg-[var(--input)]'}`}
                >
                  {selectedItemIds.length === cart.length && <CheckSquare className="w-3 h-3 text-white dark:text-black" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] group-hover:text-[var(--foreground)]">Select All units ({selectedItemIds.length} / {cart.length})</span>
              </label>
              {selectedItemIds.length > 0 && (
                 <button 
                  onClick={() => setSelectedItemIds([])}
                  className="text-red-500 hover:text-red-400 text-[9px] font-black uppercase tracking-widest"
                 >
                   Clear Selection
                 </button>
              )}
            </div>

            {cart.map((item) => (
              <div key={item.product?._id} className="bg-[var(--card)] border border-(--card-border) rounded-xl p-4 flex gap-4 hover:border-[var(--primary)]/30 transition-all group shadow-sm">
                <div 
                  onClick={() => handleCheckboxChange(item.product?._id || '', !selectedItemIds.includes(item.product?._id || ''))}
                  className={`w-4 h-4 rounded border flex-shrink-0 mt-1 cursor-pointer flex items-center justify-center transition-all ${selectedItemIds.includes(item.product?._id || '') ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-(--card-border) bg-[var(--input)]'}`}
                >
                  {selectedItemIds.includes(item.product?._id || '') && <CheckSquare className="w-3 h-3 text-white dark:text-black" />}
                </div>
                
                <div className="w-20 h-20 bg-[var(--input)] rounded-lg overflow-hidden flex-shrink-0 border border-(--card-border)">
                  {item.product?.images && item.product.images.length > 0 ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--muted)] opacity-20"><Package size={24} /></div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors cursor-pointer truncate uppercase text-black dark:text-white" onClick={() => goToProduct(item.product?._id)}>
                        {item.product?.name}
                      </h3>
                      <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest mt-0.5">{item.product?.category} • {item.product?.brand}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.product?._id)}
                      className="p-1.5 text-[var(--muted)] hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-3 bg-[var(--input)] border border-(--card-border) rounded-lg px-2 py-1">
                      <button 
                        onClick={() => addToCart(item.product?._id, -1)}
                        disabled={item.quantity <= 1}
                        className="text-[var(--muted)] hover:text-[var(--primary)] disabled:opacity-30 transition-all p-0.5"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-black text-[var(--foreground)] w-4 text-center text-black dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item.product?._id, 1)}
                        className="text-[var(--muted)] hover:text-[var(--primary)] transition-all p-0.5"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-black text-[var(--primary)]">${((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-6 shadow-sm sticky top-28">
              <h2 className="text-xs font-black text-[var(--foreground)] mb-5 uppercase tracking-[0.2em] text-black dark:text-white">System Valuation</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[var(--muted)] font-black uppercase tracking-widest">Base Subtotal</span>
                  <span className="text-[var(--foreground)] font-black text-black dark:text-white">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[var(--muted)] font-black uppercase tracking-widest">Neural Tax (5%)</span>
                  <span className="text-[var(--foreground)] font-black text-black dark:text-white">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[var(--muted)] font-black uppercase tracking-widest">Logistics</span>
                  <span className="text-green-500 font-black uppercase tracking-widest">Free</span>
                </div>
                <div className="border-t border-(--card-border) pt-3 mt-3 flex justify-between items-end">
                  <span className="text-[var(--foreground)] font-black uppercase tracking-widest text-[10px] text-black dark:text-white">Total Manifest Value</span>
                  <span className="text-xl font-black text-[var(--primary)] drop-shadow-sm">${total.toLocaleString()}</span>
                </div>
              </div>

              <Link 
                href={`/checkout?selectedItems=${encodeURIComponent(JSON.stringify(selectedItemIds))}`} 
                className={`w-full bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-3 rounded-xl mb-4 transition-all active:scale-95 shadow-md uppercase tracking-widest text-[10px] flex justify-center items-center ${selectedItemIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-disabled={selectedItemIds.length === 0}
                onClick={(e) => selectedItemIds.length === 0 && e.preventDefault()}
              >
                Proceed to Checkout
              </Link>
              
              <div className="flex items-center gap-2 justify-center text-[8px] text-[var(--muted)] font-black uppercase tracking-widest">
                <ShieldCheck size={12} className="text-[var(--primary)]/50" /> Secure Protocol Active
              </div>
            </div>

            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-xl p-4">
              <p className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest mb-1.5">EZPC_ Certified</p>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed font-medium">All hardware undergoes rigorous neural validation before logistics dispatch.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
