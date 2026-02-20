'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, Package, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { cart, loading, user, addToCart, removeFromCart } = useAuth();

  const subtotal = cart.reduce((acc, curr) => acc + (curr.product?.price * curr.quantity), 0);
  const tax = subtotal * 0.05; // 5% example tax
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="animate-pulse text-slate-500 font-black uppercase tracking-widest text-xs">Accessing your secure cart...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Shopping Cart<span className="text-cyan-400">_</span></h1>
          <p className="text-slate-500 mt-2">Manage your selected hardware before checkout</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      {!user ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-20 text-center">
          <ShoppingCart size={48} className="mx-auto text-slate-800 mb-6" />
          <h2 className="text-2xl font-black text-white mb-4">Authentication Required</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">Please sign in to view and manage your shopping cart.</p>
          <Link href="/login" className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-black transition-all">
            SIGN IN
          </Link>
        </div>
      ) : cart.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-20 text-center">
          <ShoppingCart size={48} className="mx-auto text-slate-800 mb-6" />
          <h2 className="text-2xl font-black text-white mb-4">Your Cart is Empty</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">You haven't added any components to your cart yet.</p>
          <Link href="/" className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-black transition-all">
            GO TO SHOP
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.product?._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-6 hover:border-slate-700 transition-all group">
                <div className="w-24 h-24 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700">
                  {item.product?.images && item.product.images.length > 0 ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Package size={32} /></div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">{item.product?.name}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{item.product?.category} • {item.product?.brand}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product?._id)}
                      className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1">
                      <button 
                        onClick={() => addToCart(item.product?._id, -1)}
                        disabled={item.quantity <= 1}
                        className="text-slate-500 hover:text-cyan-400 disabled:opacity-30 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-black text-white w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item.product?._id, 1)}
                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-lg font-black text-cyan-400">${(item.product?.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl sticky top-32">
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Subtotal</span>
                  <span className="text-white font-black">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Estimated Tax (5%)</span>
                  <span className="text-white font-black">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Shipping</span>
                  <span className="text-green-500 font-black uppercase">Free</span>
                </div>
                <div className="border-t border-slate-800 pt-4 mt-4 flex justify-between">
                  <span className="text-white font-black uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-cyan-400 shadow-cyan-500/20 shadow-sm">${total.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl mb-4 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.2)] uppercase tracking-widest text-sm">
                Proceed to Checkout
              </button>
              
              <div className="flex items-center gap-2 justify-center text-[10px] text-slate-600 font-black uppercase tracking-widest">
                <ShieldCheck size={14} className="text-cyan-500/50" /> Secure Checkout Verified
              </div>
            </div>

            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-6">
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2">EZPC_ Advantage</p>
              <p className="text-xs text-slate-400 leading-relaxed">All components are fully tested and certified by our neural technicians before shipping.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
