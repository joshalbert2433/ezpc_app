'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  specs: string;
}

const MOCK_CART: CartItem[] = [
  {
    id: 1,
    name: "ASUS ROG Strix RTX 4090 OC",
    price: 1999.99,
    quantity: 1,
    image: "GPU",
    specs: "24GB GDDR6X • DLSS 3.5"
  },
  {
    id: 7,
    name: "AMD Ryzen 9 7950X3D",
    price: 699.00,
    quantity: 1,
    image: "CPU",
    specs: "16 Cores • 32 Threads • 144MB Cache"
  }
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(MOCK_CART);

  const updateQuantity = (id: number, delta: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 25.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4">Your cart is empty</h2>
        <p className="text-slate-400 mb-8">Looks like you haven't added any components to your build yet.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-cyan-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Components
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <h1 className="text-3xl font-black tracking-tight">Shopping Cart <span className="text-cyan-500">({items.length})</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-6 items-center">
              <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase">{item.image}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{item.specs}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-cyan-400 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-cyan-400 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm">
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-xl font-black text-cyan-400">${(item.price * item.quantity).toLocaleString()}</p>
                <p className="text-xs text-slate-500">${item.price.toLocaleString()} each</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sticky top-28">
            <h3 className="text-xl font-black mb-6 border-b border-slate-800 pb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-100">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-slate-100">${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax</span>
                <span className="text-slate-100">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-800 pt-4 flex justify-between items-end">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black text-cyan-400">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button className="w-full bg-cyan-500 text-black font-black py-4 rounded-xl hover:bg-cyan-400 transition-all transform active:scale-[0.98]">
              PROCEED TO CHECKOUT
            </button>
            
            <p className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-widest">
              Secure Checkout Powered by EZPC
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
