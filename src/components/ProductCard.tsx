// src/components/ProductCard.tsx
'use client';

import { Cpu, ShoppingCart, Heart } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types/product';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user, addToCart, toggleWishlist, wishlist } = useAuth();
  const router = useRouter();

  const isWishlisted = wishlist.some(item => (item._id || item.id) === product.id);
  const isOnSale = product.badge === 'sale' && product.salePrice && product.salePrice > 0;

  const handleAction = async (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.id) {
      toast.error('Product ID missing');
      return;
    }

    if (action === 'cart') {
      await addToCart(product.id);
    } else {
      await toggleWishlist(product.id);
    }
  };

  const goToProduct = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div 
      onClick={goToProduct}
      className="group bg-[var(--card)] border border-(--card-border) rounded-2xl p-3 hover:border-[var(--primary)]/50 transition-all duration-300 relative overflow-hidden block cursor-pointer shadow-sm hover:shadow-xl"
    >
      {product.badge && (
        <span className={`absolute top-2 left-2 text-[7px] font-black px-1.5 py-0.5 rounded uppercase z-10 shadow-lg tracking-widest ${
          product.badge === 'sale' ? 'bg-red-500 text-white animate-pulse' :
          product.badge === 'hot' ? 'bg-orange-500 text-white shadow-orange-500/50' :
          'bg-[var(--primary)] text-white dark:text-black shadow-cyan-500/50'
        }`}>
          {product.badge === 'sale' && product.price && product.salePrice 
            ? `${Math.round((1 - product.salePrice / product.price) * 100)}% OFF` 
            : product.badge}
        </span>
      )}
      
      <button 
        onClick={(e) => handleAction(e, 'wishlist')}
        className={`absolute top-2 right-2 p-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-sm transition-all z-10 border border-(--card-border) hover:scale-110 ${isWishlisted ? 'text-red-500 border-red-500/30' : 'text-[var(--muted)] hover:text-red-500'}`}
      >
        <Heart size={12} fill={isWishlisted ? "currentColor" : "none"} />
      </button>
      
      <div className="aspect-square bg-[var(--input)] rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden border border-(--card-border)">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <Cpu className="w-10 h-10 text-[var(--muted)] opacity-20 group-hover:text-[var(--primary)] transition-colors" />
        )}
      </div>

      <div className="space-y-0.5 mb-3">
        <h4 className="font-black text-[var(--foreground)] text-[11px] line-clamp-2 group-hover:text-[var(--primary)] transition-colors uppercase tracking-tight leading-tight min-h-[32px]">{product.name}</h4>
        <p className="text-[8px] text-[var(--muted)] font-bold uppercase tracking-wider">{product.brand} • {product.category}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-(--card-border)">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-black ${isOnSale ? 'text-red-500' : 'text-[var(--primary)]'}`}>
              ${(isOnSale ? product.salePrice : product.price)?.toLocaleString()}
            </span>
            {isOnSale && (
              <span className="text-[8px] text-[var(--muted)] line-through font-bold">
                ${product.price.toLocaleString()}
              </span>
            )}
          </div>
          <span className={`text-[7px] font-black uppercase tracking-widest ${product.stock <= 0 ? 'text-red-500' : 'text-[var(--muted)]'}`}>
            {product.stock <= 0 ? 'Out of Stock' : `${product.stock} IN STOCK`}
          </span>
        </div>
        <button 
          onClick={(e) => handleAction(e, 'cart')}
          disabled={product.stock <= 0}
          className={`p-2 rounded-lg transition-all border ${
            product.stock <= 0 
              ? 'border-(--card-border) text-[var(--muted)] opacity-30 cursor-not-allowed' 
              : 'border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white dark:hover:text-black hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'
          }`}
        >
          <ShoppingCart size={14} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
