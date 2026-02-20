// src/components/ProductCard.tsx
'use client';

import { Cpu, ShoppingCart, Heart } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types/product';

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
      className="group bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden block cursor-pointer shadow-xl"
    >
      {product.badge && (
        <span className={`absolute top-3 left-3 text-[9px] font-black px-2 py-1 rounded uppercase z-10 shadow-lg tracking-widest ${
          product.badge === 'sale' ? 'bg-red-500 text-white animate-pulse' :
          product.badge === 'hot' ? 'bg-orange-500 text-white shadow-orange-500/50' :
          'bg-cyan-500 text-black shadow-cyan-500/50'
        }`}>
          {product.badge === 'sale' && product.price && product.salePrice 
            ? `-${Math.round((1 - product.salePrice / product.price) * 100)}% OFF` 
            : product.badge}
        </span>
      )}
      
      <button 
        onClick={(e) => handleAction(e, 'wishlist')}
        className={`absolute top-3 right-3 p-2 rounded-full bg-slate-800/80 transition-all z-10 border border-slate-700 hover:scale-110 ${isWishlisted ? 'text-red-500 border-red-500/30' : 'text-slate-400'}`}
      >
        <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
      </button>
      
      <div className="aspect-square bg-slate-800/50 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden border border-slate-800">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <Cpu className="w-16 h-16 text-slate-700 group-hover:text-cyan-500/20 transition-colors" />
        )}
      </div>

      <div className="space-y-1 mb-4">
        <h4 className="font-black text-white text-sm line-clamp-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{product.name}</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{product.brand} • {product.category}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black ${isOnSale ? 'text-red-500' : 'text-cyan-400'}`}>
              ${(isOnSale ? product.salePrice : product.price)?.toLocaleString()}
            </span>
            {isOnSale && (
              <span className="text-[10px] text-slate-500 line-through font-bold">
                ${product.price.toLocaleString()}
              </span>
            )}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${product.stock <= 0 ? 'text-red-500' : 'text-slate-600'}`}>
            {product.stock <= 0 ? 'Out of Stock' : `${product.stock} Units In Stock`}
          </span>
        </div>
        <button 
          onClick={(e) => handleAction(e, 'cart')}
          disabled={product.stock <= 0}
          className={`p-2.5 rounded-xl transition-all border ${
            product.stock <= 0 
              ? 'border-slate-800 text-slate-800 cursor-not-allowed' 
              : 'border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'
          }`}
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
