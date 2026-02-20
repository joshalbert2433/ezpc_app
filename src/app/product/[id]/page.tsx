'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Cpu, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import type { Product } from '@/types/product';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct({ ...data, id: data._id || data.id });
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-20 text-center animate-pulse text-slate-500">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4">Product Not Found</h2>
        <Link href="/" className="text-cyan-500 hover:underline">Back to Shop</Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumbs / Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to components
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Section */}
        <div className="space-y-6">
          <div className="aspect-square bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group">
              {product.badge && (
              <span className="absolute top-6 left-6 bg-cyan-500 text-black text-xs font-black px-3 py-1 rounded-full z-10">
                {product.badge}
              </span>
            )}
            <Cpu className="w-48 h-48 text-slate-800 group-hover:text-cyan-500/10 transition-colors duration-500" />
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, label: "3 Year Warranty" },
              { icon: Truck, label: "Fast Shipping" },
              { icon: RotateCcw, label: "14-Day Returns" }
            ].map((badge, i) => (
              <div key={i} className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 text-center">
                <badge.icon className="w-5 h-5 text-cyan-500 mx-auto mb-2" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-cyan-500 font-bold text-sm tracking-widest uppercase">{product.brand}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500 text-sm">{product.category}</span>
          </div>
          
          <h1 className="text-4xl font-black mb-4 tracking-tight">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
              ))}
              <span className="ml-2 font-bold text-slate-200">{product.rating}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2 text-slate-400">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">{product.reviews} Reviews</span>
            </div>
          </div>

          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            {product.description || "High-performance component designed for enthusiasts and professional builders."}
          </p>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-slate-500 text-sm block mb-1">Current Price</span>
                <span className="text-4xl font-black text-cyan-400">${product.price.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-green-500 text-sm font-bold block mb-1">In Stock</span>
                <span className="text-slate-500 text-xs">Ready to ship from Dubai</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="hover:text-cyan-400 transition-colors">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-black text-xl">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="hover:text-cyan-400 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <button className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl py-4 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                <ShoppingCart className="w-5 h-5" /> ADD TO CART
              </button>
              
              <button className="p-4 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-red-400 transition-all">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="flex-1">
            <div className="flex border-b border-slate-800 mb-6">
              <button 
                onClick={() => setActiveTab('specs')}
                className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-colors relative ${activeTab === 'specs' ? 'text-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Specifications
                {activeTab === 'specs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500" />}
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-colors relative ${activeTab === 'reviews' ? 'text-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Reviews ({product.reviews})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500" />}
              </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === 'specs' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(product.fullSpecs || [
                    { label: "Category", value: product.category },
                    { label: "Chipset", value: product.brand },
                    { label: "Series", value: product.specs }
                  ]).map((spec: any, i: number) => (
                    <div key={i} className="flex justify-between p-3 border-b border-slate-800/50">
                      <span className="text-slate-500 text-sm">{spec.label}</span>
                      <span className="text-slate-200 text-sm font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">ExtremeGamer_99</span>
                      <div className="flex text-yellow-400"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                    </div>
                    <p className="text-sm text-slate-400">Absolute beast of a card. Crushes everything at 4K. Temps are surprisingly good for such a monster.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
