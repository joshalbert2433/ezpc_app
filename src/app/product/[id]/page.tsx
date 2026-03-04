'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  X,
  Send,
  Loader2,
  Check
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

interface ReviewData {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, addToCart, toggleWishlist, wishlist } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Review states
  const [reviewsList, setReviewsList] = useState<ReviewData[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement>(null);

  const isWishlisted = wishlist.some(item => (item._id || item.id) === id);

  const marketingHype = React.useMemo(() => {
    const templates = [
      `The ${product?.name} ${product?.category} from ${product?.brand} represents the pinnacle of performance engineering.`,
      `Engineered for elite performance, the ${product?.name} sets a new benchmark in ${product?.category} technology.`,
      `Experience unmatched power with the ${product?.brand} ${product?.name}, a masterpiece of modern hardware design.`,
      `The ${product?.name} is meticulously crafted by ${product?.brand} to deliver extreme results for demanding enthusiasts.`,
      `Unlock the true potential of your build with the industry-leading ${product?.name} ${product?.category}.`,
      `Forged in the pursuit of perfection, the ${product?.brand} ${product?.name} redefines what is possible in ${product?.category} hardware.`,
      `A synergy of raw power and elegant design, the ${product?.name} is the definitive choice for next-gen setups.`
    ];
    // Use product name length + category length as a seed for stable "randomness" per product
    const seed = (product?.name?.length || 0) + (product?.category?.length || 0);
    return templates[seed % templates.length];
  }, [product]);

  const StarRating = ({ rating, size = 12, interactive = false, onRatingChange }: { rating: number, size?: number, interactive?: boolean, onRatingChange?: (r: number) => void }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'transition-transform active:scale-90' : 'cursor-default'}`}
          >
            <Star 
              size={size} 
              className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-[var(--muted)]/30'} transition-colors`} 
            />
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    // Check for tab parameter in URL
    const tab = searchParams.get('tab');
    if (tab === 'reviews') {
      setActiveTab('reviews');
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'reviews' && canReview && reviewFormRef.current) {
      setTimeout(() => {
        reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [activeTab, canReview]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
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

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/products/${id}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviewsList(data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    const checkEligibility = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/products/${id}/review-eligibility`);
        if (response.ok) {
          const data = await response.json();
          setCanReview(data.canReview);
        }
      } catch (error) {
        console.error('Failed to check review eligibility:', error);
      }
    };

    fetchProduct();
    fetchReviews();
    checkEligibility();
  }, [id, user]);

  const handleAction = async (action: string) => {
    if (action === 'cart') {
      await addToCart(id as string, quantity);
    } else {
      await toggleWishlist(id as string);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Review submitted!');
        setReviewsList([data.review, ...reviewsList]);
        setCanReview(false);
        setNewComment('');
        setIsReviewModalOpen(false);
        // Fetch product again to get updated rating/reviews count
        const productRes = await fetch(`/api/products/${id}`);
        if (productRes.ok) {
          const productData = await productRes.json();
          setProduct({ 
            ...productData, 
            id: productData._id || productData.id,
            images: productData.images || []
          });
        }
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs text-black dark:text-white">Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-black mb-4 text-[var(--foreground)] text-black dark:text-white">Product Not Found</h2>
        <Link href="/" className="inline-block bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2.5 rounded-xl font-black transition-all text-xs uppercase tracking-widest">
          RETURN TO SHOP
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const isOnSale = product.badge === 'sale' && product.salePrice && product.salePrice > 0;

  return (
    <main className="max-w-7xl mx-auto px-6 py-6 transition-colors duration-300">
      {/* Breadcrumbs / Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] mb-6 transition-colors group">
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-[10px] font-black uppercase tracking-widest">Back to catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Product Image Section (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-[var(--card)] border border-(--card-border) rounded-2xl relative overflow-hidden group shadow-sm">
            {product.badge && (
              <span className={`absolute top-4 left-4 text-[8px] font-black px-2 py-1 rounded-md z-20 shadow-lg uppercase tracking-widest ${
                product.badge === 'sale' ? 'bg-red-500 text-white animate-pulse' :
                product.badge === 'hot' ? 'bg-orange-500 text-white shadow-orange-500/50' :
                'bg-[var(--primary)] text-white dark:text-black shadow-cyan-500/50'
              }`}>
                {product.badge === 'sale' && product.price && product.salePrice 
                  ? `${Math.round((1 - product.salePrice / product.price) * 100)}% OFF` 
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
                        className="w-full h-full flex items-center justify-center p-6 cursor-zoom-in relative"
                        onClick={() => setZoomImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} - ${index + 1}`} 
                          className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-4 right-4 p-1.5 bg-[var(--background)]/50 backdrop-blur-md rounded-lg border border-(--card-border) opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={14} className="text-[var(--primary)]" />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation */}
                {images.length > 1 && (
                  <>
                    <button className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--background)]/80 backdrop-blur-md border border-(--card-border) text-[var(--muted)] hover:text-[var(--primary)] transition-all group active:scale-90 shadow-sm">
                      <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--background)]/80 backdrop-blur-md border border-(--card-border) text-[var(--muted)] hover:text-[var(--primary)] transition-all group active:scale-90 shadow-sm">
                      <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Cpu className="w-20 h-20 text-[var(--muted)] opacity-20 mb-3" />
                <p className="text-[var(--muted)] text-[8px] font-black uppercase tracking-widest">No visual data</p>
              </div>
            )}
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "3yr Warranty" },
              { icon: Truck, label: "Fast Ship" },
              { icon: RotateCcw, label: "14d Return" }
            ].map((badge, i) => (
              <div key={i} className="bg-[var(--card)] border border-(--card-border) rounded-xl p-3 text-center hover:border-[var(--primary)]/30 transition-all group cursor-default shadow-sm">
                <badge.icon className="w-4 h-4 text-[var(--primary)] mx-auto mb-2 group-hover:scale-110 transition-all" />
                <span className="text-[7px] text-[var(--muted)] font-black uppercase tracking-widest block transition-colors leading-none">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Section (7 columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[var(--primary)] font-black text-[10px] tracking-[0.3em] uppercase">{product.brand}</span>
            <span className="text-[var(--card-border)] font-black">/</span>
            <span className="text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.2em]">{product.category}</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter text-[var(--foreground)] leading-tight text-black dark:text-white uppercase">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 bg-[var(--input)] px-2 py-1 rounded-lg border border-(--card-border)">
              <StarRating rating={product.rating || 0} size={12} />
              <span className="ml-1 font-black text-[var(--foreground)] text-[11px] text-black dark:text-white">{product.rating || '0'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--muted)] font-black text-[9px] uppercase tracking-widest">
              <MessageSquare className="w-3 h-3 text-[var(--primary)]/50" />
              <span>{product.reviews || 0} Build Reviews</span>
            </div>
          </div>

          <p className="text-[var(--muted)] text-sm mb-6 leading-relaxed font-medium border-l-2 border-[var(--primary)]/20 pl-4 italic">
            {product.description || marketingHype}
          </p>

          <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-6 mb-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[var(--muted)] text-[8px] font-black uppercase tracking-[0.2em] block mb-1">
                  {isOnSale ? 'Promotional Value' : 'Standard Value'}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-black ${isOnSale ? 'text-red-500' : 'text-[var(--foreground)] text-black dark:text-white'}`}>
                    ${(isOnSale ? product.salePrice : product.price)?.toLocaleString()}
                  </span>
                  {isOnSale && (
                    <span className="text-sm text-[var(--muted)] line-through font-black">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'text-[var(--primary)]' : 'text-red-500'}`}>
                    {product.stock > 0 ? 'Ready' : 'Out of Stock'}
                  </span>
                </div>
                <span className="text-[var(--muted)] text-[8px] font-black uppercase tracking-widest">
                  {product.stock > 0 ? `${product.stock} Units In Stock` : 'Restocking'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center justify-between bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-2 sm:w-32">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-[var(--muted)] hover:text-[var(--primary)] transition-all p-1">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-base text-[var(--foreground)] w-6 text-center text-black dark:text-white">{product.stock > 0 ? quantity : 0}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="text-[var(--muted)] hover:text-[var(--primary)] transition-all p-1">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <button 
                onClick={() => handleAction('cart')}
                disabled={product.stock <= 0}
                className="flex-1 bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:bg-[var(--card-border)] disabled:text-[var(--muted)] disabled:shadow-none disabled:cursor-not-allowed text-[10px] uppercase tracking-[0.2em]"
              >
                <ShoppingCart className="w-4 h-4" /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              <button 
                onClick={() => handleAction('wishlist')}
                className={`p-3 border border-(--card-border) rounded-xl transition-all group ${isWishlisted ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-[var(--input)] hover:bg-[var(--background)] hover:text-red-400 text-[var(--muted)]'}`}
              >
                <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="flex-1">
            <div className="flex border-b border-(--card-border) mb-6 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('specs')}
                className={`px-6 py-3 font-black text-[9px] uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === 'specs' ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                Specifications
                {activeTab === 'specs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)]" />}
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-black text-[9px] uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === 'reviews' ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                User Feedback ({product.reviews || 0})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)]" />}
              </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
              {activeTab === 'specs' ? (
                <div className="space-y-6">
                  {/* Brief Specs Summary */}
                  <div className="bg-[var(--input)]/20 p-5 rounded-2xl border border-(--card-border)">
                    <h3 className="text-[8px] font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-3 opacity-70">Sector Brief</h3>
                    <p className="text-[11px] text-[var(--foreground)] font-medium leading-relaxed italic text-black dark:text-white">
                      {product.specs}
                    </p>
                  </div>

                  {/* Detailed Key-Value Grid */}
                  <div>
                    <h3 className="text-[8px] font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-4 opacity-70">Technical Manifest</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0.5">
                      {/* Standard Specs */}
                      <div className="flex justify-between items-center py-2 border-b border-(--card-border) group cursor-default">
                        <span className="text-[var(--muted)] text-[9px] font-black uppercase tracking-widest">Brand</span>
                        <span className="text-[var(--foreground)] text-[9px] font-black text-black dark:text-white">{product.brand}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-(--card-border) group cursor-default">
                        <span className="text-[var(--muted)] text-[9px] font-black uppercase tracking-widest">Category</span>
                        <span className="text-[var(--foreground)] text-[9px] font-black text-black dark:text-white">{product.category}</span>
                      </div>

                      {/* Custom Detailed Specs */}
                      {(product.fullSpecs || []).map((spec: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-(--card-border) group cursor-default">
                          <span className="text-[var(--muted)] text-[9px] font-black uppercase tracking-widest">{spec.label}</span>
                          <div className="text-[var(--foreground)] text-[9px] font-black text-black dark:text-white">
                            {spec.value === 'true' ? <Check size={12} className="text-green-500" strokeWidth={4} /> : 
                             spec.value === 'false' ? <X size={12} className="text-red-500" strokeWidth={4} /> : 
                             spec.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Reviews Header */}
                  <div className="flex justify-between items-center bg-[var(--input)]/20 p-4 rounded-2xl border border-(--card-border)">
                    <div>
                      <h3 className="text-sm font-black text-[var(--foreground)] uppercase text-black dark:text-white">Feedback Hub</h3>
                      <p className="text-[8px] text-[var(--muted)] font-black tracking-widest uppercase">Verified user logs</p>
                    </div>
                    {canReview && (
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <Plus size={12} /> Log Experience
                      </button>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="grid grid-cols-1 gap-4">
                    {reviewsList.length === 0 ? (
                      <div className="text-center py-10 bg-[var(--input)]/10 rounded-2xl border border-dashed border-(--card-border)">
                        <MessageSquare className="mx-auto text-[var(--muted)] opacity-10 mb-3" size={32} />
                        <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">No logs recorded in this sector</p>
                      </div>
                    ) : (
                      reviewsList.map((review) => (
                        <div key={review._id} className="bg-[var(--card)] p-5 rounded-2xl border border-(--card-border) shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-[10px] border border-[var(--primary)]/20 uppercase">
                                {review.userName.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-black text-[var(--foreground)] text-[11px] uppercase text-black dark:text-white leading-none">{review.userName}</p>
                                <p className="text-[8px] text-[var(--muted)] font-black uppercase tracking-[0.1em] mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} size={10} />
                          </div>
                          <p className="text-[11px] text-[var(--muted)] leading-relaxed font-medium italic">
                            "{review.comment}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Lightbox */}
      <AnimatePresence>
        {zoomImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full flex items-center justify-center z-10 pointer-events-none"
            >
              <img src={zoomImage} alt="Product Zoom" className="max-w-full max-h-[80vh] object-contain drop-shadow-2xl" />
              <button onClick={() => setZoomImage(null)} className="absolute -top-10 right-0 p-2 text-white bg-slate-900 rounded-full pointer-events-auto active:scale-90">
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-[var(--card)] border border-(--card-border) rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-[var(--foreground)] uppercase text-black dark:text-white">Log Feedback</h2>
                  <button onClick={() => setIsReviewModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={20} /></button>
                </div>
                <form onSubmit={submitReview} className="space-y-5">
                  <div className="bg-[var(--input)] border border-(--card-border) p-3 rounded-xl flex items-center justify-between">
                    <span className="text-[9px] font-black text-[var(--muted)] uppercase">Rating</span>
                    <StarRating rating={newRating} size={24} interactive onRatingChange={setNewRating} />
                  </div>
                  <textarea
                    required
                    placeholder="Describe your build experience..."
                    className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl p-4 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all h-28 resize-none text-xs font-medium text-black dark:text-white"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 bg-[var(--input)] text-[var(--foreground)] font-black py-3 rounded-xl text-[9px] uppercase tracking-widest">Cancel</button>
                    <button type="submit" disabled={submittingReview} className="flex-[2] bg-[var(--primary)] text-white dark:text-black font-black py-3 rounded-xl text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                      {submittingReview ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                      Execute Log
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .product-swiper .custom-bullet {
          display: inline-block;
          width: 12px;
          height: 3px;
          background: var(--card-border);
          margin: 0 3px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .product-swiper .custom-bullet-active {
          background: var(--primary);
          width: 24px;
        }
        .swiper-pagination {
          bottom: 16px !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--card-border);
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
