'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, Package, ShieldCheck, Square, CheckSquare } from 'lucide-react';
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

  const goToProduct = (product_id : number) => {
    console.log(product_id)
    router.push(`product/${product_id}`)
  }

  console.log(cart)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Loading your cart...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 transition-colors duration-300">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight">Shopping Cart<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--muted)] mt-2">Manage your selected hardware before checkout</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      {!user ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-20 text-center shadow-sm">
          <ShoppingCart size={48} className="mx-auto text-[var(--card-border)] mb-6" />
          <h2 className="text-2xl font-black text-[var(--foreground)] mb-4">Login Required</h2>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-8">Please sign in to view and manage your shopping cart.</p>
          <Link href="/login" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all">
            SIGN IN
          </Link>
        </div>
      ) : cart.length === 0 ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-20 text-center shadow-sm">
          <ShoppingCart size={48} className="mx-auto text-[var(--card-border)] mb-6" />
          <h2 className="text-2xl font-black text-[var(--foreground)] mb-4">Your Cart is Empty</h2>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-8">You haven't added any products to your cart yet.</p>
          <Link href="/" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all">
            GO TO SHOP
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  className="form-checkbox text-[var(--primary)] h-5 w-5 rounded focus:ring-[var(--primary)]"
                  checked={selectedItemIds.length === cart.length && cart.length > 0}
                  onChange={(e) => handleSelectAllChange(e.target.checked)}
                />
                <span className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">Select All ({selectedItemIds.length} / {cart.length})</span>
              </label>
              {selectedItemIds.length > 0 && (
                 <button 
                  onClick={() => setSelectedItemIds([])}
                  className="text-red-500 hover:text-red-400 text-xs font-bold"
                 >
                   Clear Selection
                 </button>
              )}
            </div>

            {cart.map((item) => (
              <div key={item.product?._id} className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-6 flex gap-4 hover:border-[var(--primary)]/30 transition-all group shadow-sm">
                <input 
                  type="checkbox"
                  className="form-checkbox text-[var(--primary)] h-5 w-5 rounded focus:ring-[var(--primary)] mt-0.5"
                  checked={selectedItemIds.includes(item.product?._id || '')}
                  onChange={(e) => handleCheckboxChange(item.product?._id || '', e.target.checked)}
                />
                <div className="w-24 h-24 bg-[var(--input)] rounded-xl overflow-hidden flex-shrink-0 border border-(--card-border)">
                  {item.product?.images && item.product.images.length > 0 ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--muted)] opacity-20"><Package size={32} /></div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors hover:underline cursor-pointer" onClick={() => goToProduct(item.product?._id)}>{item.product?.name}</h3>
                      <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider mt-1">{item.product?.category} • {item.product?.brand}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.product?._id)}
                      className="p-2 text-[var(--muted)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center gap-4 bg-[var(--input)] border border-(--card-border) rounded-lg px-3 py-1">
                      <button 
                        onClick={() => addToCart(item.product?._id, -1)}
                        disabled={item.quantity <= 1}
                        className="text-[var(--muted)] hover:text-[var(--primary)] disabled:opacity-30 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-black text-[var(--foreground)] w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item.product?._id, 1)}
                        className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-lg font-black text-[var(--primary)]">${((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 shadow-xl sticky top-32">
              <h2 className="text-xl font-black text-[var(--foreground)] mb-6 uppercase tracking-widest">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)] font-bold">Subtotal</span>
                  <span className="text-[var(--foreground)] font-black">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)] font-bold">Estimated Tax (5%)</span>
                  <span className="text-[var(--foreground)] font-black">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)] font-bold">Shipping</span>
                  <span className="text-green-500 font-black uppercase">Free</span>
                </div>
                <div className="border-t border-(--card-border) pt-4 mt-4 flex justify-between">
                  <span className="text-[var(--foreground)] font-black uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-[var(--primary)] drop-shadow-sm">${total.toLocaleString()}</span>
                </div>
              </div>

              <Link 
                href={`/checkout?selectedItems=${encodeURIComponent(JSON.stringify(selectedItemIds))}`} 
                className={`w-full bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-4 rounded-xl mb-4 transition-all active:scale-95 shadow-lg uppercase tracking-widest text-sm flex justify-center items-center ${selectedItemIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-disabled={selectedItemIds.length === 0}
                onClick={(e) => selectedItemIds.length === 0 && e.preventDefault()}
              >
                Proceed to Checkout
              </Link>
              
              <div className="flex items-center gap-2 justify-center text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">
                <ShieldCheck size={14} className="text-[var(--primary)]/50" /> Secure Checkout Verified
              </div>
            </div>

            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl p-6">
              <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-2">EZPC_ Advantage</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">All products are fully tested and certified before shipping.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
