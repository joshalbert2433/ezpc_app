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

  const StarRating = ({ rating, size = 16, interactive = false, onRatingChange }: { rating: number, size?: number, interactive?: boolean, onRatingChange?: (r: number) => void }) => {
    return (
      <div className="flex gap-1">
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
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4 text-[var(--foreground)]">Product Not Found</h2>
        <Link href="/" className="inline-block bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all">
          RETURN TO SHOP
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const isOnSale = product.badge === 'sale' && product.salePrice && product.salePrice > 0;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-300">
      {/* Breadcrumbs / Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-xs font-black uppercase tracking-widest">Back to products</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Section */}
        <div className="space-y-6">
          <div className="aspect-square bg-[var(--card)] border border-(--card-border) rounded-3xl relative overflow-hidden group shadow-lg">
            {product.badge && (
              <span className={`absolute top-6 left-6 text-[10px] font-black px-3 py-1.5 rounded-full z-20 shadow-lg uppercase tracking-widest ${
                product.badge === 'sale' ? 'bg-red-500 text-white animate-pulse' :
                product.badge === 'hot' ? 'bg-orange-500 text-white shadow-orange-500/50' :
                'bg-[var(--primary)] text-white dark:text-black shadow-cyan-500/50'
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
                        className="w-full h-full flex items-center justify-center p-8 cursor-zoom-in relative"
                        onClick={() => setZoomImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} - ${index + 1}`} 
                          className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute bottom-6 right-6 p-2 bg-[var(--background)]/50 backdrop-blur-md rounded-lg border border-(--card-border) opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={16} className="text-[var(--primary)]" />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation */}
                {images.length > 1 && (
                  <>
                    <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--background)]/80 backdrop-blur-md border border-(--card-border) text-[var(--muted)] hover:text-[var(--primary)] transition-all group active:scale-90 shadow-sm">
                      <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--background)]/80 backdrop-blur-md border border-(--card-border) text-[var(--muted)] hover:text-[var(--primary)] transition-all group active:scale-90 shadow-sm">
                      <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Cpu className="w-32 h-32 text-[var(--muted)] opacity-20 mb-4" />
                <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">No visual data available</p>
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
              <div key={i} className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-4 text-center hover:border-[var(--primary)]/30 transition-all group cursor-default shadow-sm">
                <badge.icon className="w-6 h-6 text-[var(--primary)] mx-auto mb-3 group-hover:scale-110 transition-all" />
                <span className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest transition-colors">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[var(--primary)] font-black text-xs tracking-[0.3em] uppercase">{product.brand}</span>
            <span className="text-[var(--card-border)] font-black">/</span>
            <span className="text-[var(--muted)] text-xs font-black uppercase tracking-[0.2em]">{product.category}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-[var(--foreground)] leading-[1.1]">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-10">
            <div className="flex items-center gap-1.5 bg-[var(--input)] px-3 py-1.5 rounded-lg border border-(--card-border)">
              <StarRating rating={product.rating || 0} size={14} />
              <span className="ml-2 font-black text-[var(--foreground)] text-sm">{product.rating || 'No Rating'}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--muted)] font-black text-xs uppercase tracking-widest">
              <MessageSquare className="w-4 h-4 text-[var(--primary)]/50" />
              <span>{product.reviews || 0} Reviews</span>
            </div>
          </div>

          <p className="text-[var(--muted)] text-lg mb-10 leading-relaxed font-medium border-l-2 border-[var(--primary)]/20 pl-6 italic">
            {product.description || marketingHype}
          </p>

          <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 mb-10 shadow-xl relative overflow-hidden group">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.2em] block mb-2">
                  {isOnSale ? 'Promotional Price' : 'Unit Price'}
                </span>
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-black ${isOnSale ? 'text-red-500' : 'text-[var(--foreground)]'}`}>
                    ${(isOnSale ? product.salePrice : product.price)?.toLocaleString()}
                  </span>
                  {isOnSale && (
                    <span className="text-xl text-[var(--muted)] line-through font-black">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-cyan-400 animate-ping' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-black uppercase tracking-widest ${product.stock > 0 ? 'text-[var(--primary)]' : 'text-red-500'}`}>
                    {product.stock > 0 ? 'Status: Ready' : 'Out of Stock'}
                  </span>
                </div>
                <span className="text-[var(--muted)] text-[9px] font-black uppercase tracking-widest">
                  {product.stock > 0 ? `${product.stock} Units Available` : 'Restocking in progress'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between bg-[var(--input)] border border-(--card-border) rounded-2xl px-5 py-3 sm:w-36">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-[var(--muted)] hover:text-[var(--primary)] transition-all p-1 hover:scale-125">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-xl text-[var(--foreground)] w-8 text-center">{product.stock > 0 ? quantity : 0}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="text-[var(--muted)] hover:text-[var(--primary)] transition-all p-1 hover:scale-125">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={() => handleAction('cart')}
                disabled={product.stock <= 0}
                className="flex-1 bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black rounded-2xl py-4 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg disabled:bg-[var(--card-border)] disabled:text-[var(--muted)] disabled:shadow-none disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" /> {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
              </button>
              
              <button 
                onClick={() => handleAction('wishlist')}
                className={`p-5 border border-(--card-border) rounded-2xl transition-all group ${isWishlisted ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-[var(--input)] hover:bg-[var(--background)] hover:text-red-400 text-[var(--muted)]'}`}
              >
                <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="flex-1">
            <div className="flex border-b border-(--card-border) mb-8 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('specs')}
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === 'specs' ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                Tech Specs
                {activeTab === 'specs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)] shadow-[0_0_15px_rgba(34,211,238,0.8)]" />}
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === 'reviews' ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                Build Reviews ({product.reviews || 0})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)] shadow-[0_0_15px_rgba(34,211,238,0.8)]" />}
              </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
              {activeTab === 'specs' ? (
                <div className="space-y-10">
                  {/* Brief Specs Summary */}
                  <div className="bg-[var(--input)]/20 p-8 rounded-3xl border border-(--card-border)">
                    <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-4">Brief Overview</h3>
                    <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed italic">
                      {product.specs}
                    </p>
                  </div>

                  {/* Detailed Key-Value Grid */}
                  <div>
                    <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-6">Technical Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-1">
                      {/* Standard Specs (Always shown) */}
                      <div className="flex justify-between items-center py-4 border-b border-(--card-border) group cursor-default">
                        <span className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest group-hover:text-[var(--primary)]/50 transition-colors">Manufacturer</span>
                        <span className="text-[var(--foreground)] text-[10px] font-black group-hover:text-[var(--primary)] transition-colors">{product.brand}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-(--card-border) group cursor-default">
                        <span className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest group-hover:text-[var(--primary)]/50 transition-colors">Category</span>
                        <span className="text-[var(--foreground)] text-[10px] font-black group-hover:text-[var(--primary)] transition-colors">{product.category}</span>
                      </div>

                      {/* Custom Detailed Specs */}
                      {(product.fullSpecs || []).map((spec: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-(--card-border) group cursor-default">
                          <span className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest group-hover:text-[var(--primary)]/50 transition-colors">{spec.label}</span>
                          <div className="text-[var(--foreground)] text-[10px] font-black group-hover:text-[var(--primary)] transition-colors">
                            {spec.value === 'true' ? (
                              <div className="bg-green-500/10 text-green-500 p-1 rounded-lg border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                <Check size={14} strokeWidth={4} />
                              </div>
                            ) : spec.value === 'false' ? (
                              <div className="bg-red-500/10 text-red-500 p-1 rounded-lg border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                <X size={14} strokeWidth={4} />
                              </div>
                            ) : (
                              <span>{spec.value}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Reviews Header & Write Review Action */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--input)]/20 p-6 rounded-3xl border border-(--card-border) mb-8">
                    <div>
                      <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight uppercase">Product Feedback</h3>
                      <p className="text-xs text-[var(--muted)] font-bold tracking-widest uppercase mt-1">Authentic owner experiences</p>
                    </div>
                    {canReview && (
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2"
                      >
                        <MessageSquare size={16} /> Write a Review
                      </button>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviewsList.length === 0 ? (
                      <div className="text-center py-12 bg-[var(--input)]/30 rounded-3xl border border-dashed border-(--card-border)">
                        <MessageSquare className="mx-auto text-[var(--muted)] opacity-20 mb-4" size={48} />
                        <p className="text-[var(--muted)] text-sm font-medium italic">No reviews recorded yet for this system unit.</p>
                      </div>
                    ) : (
                      reviewsList.map((review) => (
                        <div key={review._id} className="bg-[var(--card)] p-8 rounded-3xl border border-(--card-border) hover:border-[var(--primary)]/20 transition-all group">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-xs border border-[var(--primary)]/20 transition-all uppercase">
                                {review.userName.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-black text-[var(--foreground)] text-sm tracking-tight uppercase">{review.userName}</p>
                                <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} size={12} />
                          </div>
                          <p className="text-sm text-[var(--muted)] leading-relaxed font-medium italic tracking-wide">
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
                className="absolute -top-12 right-0 md:-right-12 p-3 text-white bg-slate-900 border border-slate-800 rounded-full transition-all pointer-events-auto active:scale-90"
              >
                <X size={24} />
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--card)] border border-(--card-border) rounded-3xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase">Write a Review</h2>
                    <p className="text-xs text-[var(--muted)] font-black uppercase tracking-widest mt-1">Component: {product.name}</p>
                  </div>
                  <button 
                    onClick={() => setIsReviewModalOpen(false)}
                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={submitReview} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest block">Overall Rating</label>
                    <div className="flex items-center gap-4 bg-[var(--input)] border border-(--card-border) p-4 rounded-2xl w-fit">
                      <StarRating rating={newRating} size={32} interactive onRatingChange={setNewRating} />
                      <span className="text-xl font-black text-[var(--primary)] w-8 text-center">{newRating}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest block">Your Comment</label>
                    <textarea
                      required
                      placeholder="What was your experience with this hardware?"
                      className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl p-5 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all h-32 resize-none text-sm font-medium leading-relaxed"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="flex-1 bg-[var(--input)] hover:bg-[var(--card-border)] text-[var(--foreground)] font-black py-4 rounded-xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex-[2] bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {submittingReview ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      Submit Review
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
          width: 20px;
          height: 3px;
          background: var(--card-border);
          margin: 0 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .product-swiper .custom-bullet-active {
          background: var(--primary);
          width: 40px;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }
        .swiper-pagination {
          bottom: 24px !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
