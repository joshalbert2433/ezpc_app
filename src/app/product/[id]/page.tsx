'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { Product } from '@/types/product';
import { motion, AnimatePresence } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user, addToCart, toggleWishlist, wishlist } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const isWishlisted = wishlist.some(item => (item._id || item.id) === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Map _id to id and ensure images is present
          setProduct({ 
            ...data, 
            id: data._id || data.id,
            images: data.images || []
          });
        } else {
          toast.error('Product not found');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Error loading product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAction = async (action: string) => {
    if (action === 'cart') {
      await addToCart(id as string, quantity);
    } else {
      await toggleWishlist(id as string);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="animate-pulse text-slate-500 font-black uppercase tracking-widest text-xs">Initializing Neural Link...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4 text-white">SYSTEM_ERROR: PRODUCT_NOT_FOUND</h2>
        <Link href="/" className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-black transition-all">
          RETURN TO SHOP
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const isOnSale = product.badge === 'sale' && product.salePrice && product.salePrice > 0;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumbs / Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-xs font-black uppercase tracking-widest">Back to components</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Section */}
        <div className="space-y-6">
          <div className="aspect-square bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            {product.badge && (
              <span className={`absolute top-6 left-6 text-[10px] font-black px-3 py-1.5 rounded-full z-20 shadow-lg uppercase tracking-widest ${
                product.badge === 'sale' ? 'bg-red-500 text-white animate-pulse' :
                product.badge === 'hot' ? 'bg-orange-500 text-white shadow-orange-500/50' :
                'bg-cyan-500 text-black shadow-cyan-500/50'
              }`}>
                {product.badge === 'sale' && product.price && product.salePrice 
                  ? `${Math.round((1 - product.salePrice / product.price) * 100)}% DISCOUNT` 
                  : product.badge}
              </span>
            )}
            
            {images.length > 0 ? (
              <>
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                  }}
                  pagination={{ 
                    clickable: true,
                    bulletClass: 'custom-bullet',
                    bulletActiveClass: 'custom-bullet-active'
                  }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  loop={images.length > 1}
                  className="w-full h-full product-swiper"
                >
                  {images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div 
                        className="w-full h-full flex items-center justify-center p-8 bg-slate-900 cursor-zoom-in relative"
                        onClick={() => setZoomImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} - ${index + 1}`} 
                          className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/0f172a/22d3ee?text=Image+Unavailable';
                          }}
                        />
                        <div className="absolute bottom-6 right-6 p-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={16} className="text-cyan-400" />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Modern Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800 transition-all group active:scale-90">
                      <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800 transition-all group active:scale-90">
                      <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50">
                <Cpu className="w-32 h-32 text-slate-800 group-hover:text-cyan-500/10 transition-colors duration-500 mb-4" />
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No visual data available</p>
              </div>
            )}
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, label: "3 Year Warranty" },
              { icon: Truck, label: "Fast Shipping" },
              { icon: RotateCcw, label: "14-Day Returns" }
            ].map((badge, i) => (
              <div key={i} className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 text-center hover:border-cyan-500/30 transition-all group cursor-default">
                <badge.icon className="w-6 h-6 text-cyan-500 mx-auto mb-3 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest group-hover:text-slate-300 transition-colors">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-cyan-500 font-black text-xs tracking-[0.3em] uppercase">{product.brand}</span>
            <span className="text-slate-800 font-black">/</span>
            <span className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{product.category}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-white leading-[1.1]">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-10">
            <div className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
              ))}
              <span className="ml-2 font-black text-slate-200 text-sm">{product.rating || 4.5}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest">
              <MessageSquare className="w-4 h-4 text-cyan-500/50" />
              <span>{product.reviews || 0} Reviews</span>
            </div>
          </div>

          <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium border-l-2 border-cyan-500/20 pl-6 italic">
            {product.description || `The ${product.name} ${product.category} from ${product.brand} represents the pinnacle of performance engineering, meticulously designed for ultimate system builds.`}
          </p>

          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-cyan-500/10"></div>
            
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">
                  {isOnSale ? 'Promotional Price' : 'Unit Price'}
                </span>
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-black ${isOnSale ? 'text-red-500' : 'text-white'} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
                    ${(isOnSale ? product.salePrice : product.price)?.toLocaleString()}
                  </span>
                  {isOnSale && (
                    <span className="text-xl text-slate-500 line-through font-black">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-cyan-400 animate-ping' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-black uppercase tracking-widest ${product.stock > 0 ? 'text-cyan-400' : 'text-red-500'}`}>
                    {product.stock > 0 ? 'Status: Ready' : 'Status: Depleted'}
                  </span>
                </div>
                <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">
                  {product.stock > 0 ? `${product.stock} Units Available` : 'Restocking in progress'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between bg-dark border border-slate-800 rounded-2xl px-5 py-3 sm:w-36">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  disabled={product.stock <= 0}
                  className="text-slate-500 hover:text-cyan-400 transition-all p-1 hover:scale-125 disabled:opacity-20"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-xl text-white w-8 text-center">{product.stock > 0 ? quantity : 0}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} 
                  disabled={product.stock <= 0 || quantity >= product.stock}
                  className="text-slate-500 hover:text-cyan-400 transition-all p-1 hover:scale-125 disabled:opacity-20"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={() => handleAction('cart')}
                disabled={product.stock <= 0}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl py-4 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" /> {product.stock > 0 ? 'INITIALIZE CART' : 'OUT OF STOCK'}
              </button>
              
              <button 
                onClick={() => handleAction('wishlist')}
                className={`p-5 border border-slate-700 rounded-2xl transition-all group ${isWishlisted ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-slate-800 hover:bg-slate-700 hover:text-red-400 text-slate-400'}`}
              >
                <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="flex-1">
            <div className="flex border-b border-slate-800 mb-8 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('specs')}
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === 'specs' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Tech Specs
                {activeTab === 'specs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />}
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === 'reviews' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Build Reviews ({product.reviews || 0})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />}
              </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
              {activeTab === 'specs' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-1">
                  {(product.fullSpecs && product.fullSpecs.length > 0 ? product.fullSpecs : [
                    { label: "Category", value: product.category },
                    { label: "Manufacturer", value: product.brand },
                    { label: "Product Line", value: product.specs },
                    { label: "Global Stock", value: "Verified" },
                    { label: "Build Quality", value: "Premium" }
                  ]).map((spec: any, i: number) => (
                    <div key={i} className="flex justify-between py-4 border-b border-slate-800/30 group cursor-default">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:text-cyan-500/50 transition-colors">{spec.label}</span>
                      <span className="text-slate-300 text-[10px] font-black group-hover:text-white transition-colors">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-cyan-500/20 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-xs border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                          EX
                        </div>
                        <div>
                          <p className="font-black text-white text-sm tracking-tight uppercase">ExtremeGamer_99</p>
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Verified Builder</p>
                        </div>
                      </div>
                      <div className="flex gap-1 text-yellow-500/80">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-bold italic tracking-wide">
                      "SYSTEM PERFORMANCE OVERRIDE: This component exceeded all baseline expectations. Thermal efficiency is peak-tier and the aesthetic integration is flawless. Highly recommended for high-load operations."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Zoom Lightbox */}
      <AnimatePresence>
        {zoomImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomImage(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-zoom-out"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full aspect-square md:aspect-video bg-transparent flex items-center justify-center z-10 pointer-events-none"
            >
              <img 
                src={zoomImage} 
                alt="Product Zoom" 
                className="max-w-full max-h-full object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]" 
              />
              
              <button 
                onClick={() => setZoomImage(null)}
                className="absolute -top-12 right-0 md:-right-12 p-3 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-full transition-all pointer-events-auto active:scale-90"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .product-swiper .custom-bullet {
          display: inline-block;
          width: 20px;
          height: 3px;
          background: #1e293b;
          margin: 0 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .product-swiper .custom-bullet-active {
          background: #22d3ee;
          width: 40px;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }
        .swiper-pagination {
          bottom: 24px !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
