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
  const { user } = useAuth();
  const router = useRouter();

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Handle action here
    console.log(`${action} ${product.name}`);
    alert(`${action === 'cart' ? 'Added to cart' : 'Added to wishlist'}: ${product.name}`);
  };

  const goToProduct = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div 
      onClick={goToProduct}
      className="group bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden block cursor-pointer"
    >
      {product.badge && (
        <span className="absolute top-3 left-3 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase z-10">
          {product.badge}
        </span>
      )}
      
      <button 
        onClick={(e) => handleAction(e, 'wishlist')}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/50 text-slate-400 hover:text-red-400 transition-colors z-10"
      >
        <Heart size={16} />
      </button>
      
      <div className="aspect-square bg-slate-800 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
        <Cpu className="w-16 h-16 text-slate-700 group-hover:text-cyan-500/20 transition-colors" />
      </div>

      <h4 className="font-bold text-slate-100 mb-1 line-clamp-1">{product.name}</h4>
      <p className="text-xs text-slate-500 mb-4">{product.specs}</p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xl font-black text-cyan-400">${product.price.toLocaleString()}</span>
        <button 
          onClick={(e) => handleAction(e, 'cart')}
          className="p-2 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
        >
          <ShoppingCart size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
