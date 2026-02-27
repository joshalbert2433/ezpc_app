'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  cart: any[];
  wishlist: any[];
  refreshUser: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // Sync cart and wishlist after login
        await fetchUserAssets();
      } else {
        setUser(null);
        setCart([]);
        setWishlist([]);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAssets = async () => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        fetch('/api/user/cart', { cache: 'no-store' }),
        fetch('/api/user/wishlist', { cache: 'no-store' })
      ]);
      
      if (cartRes.ok) setCart(await cartRes.json());
      if (wishlistRes.ok) setWishlist(await wishlistRes.json());
    } catch (err) {
      console.error('Asset sync failed', err);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please login to add to cart');
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      if (res.ok) {
        toast.success('Added to cart');
        await fetchUserAssets();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await fetch('/api/user/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        toast.success('Item removed from cart');
        await fetchUserAssets();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to remove item');
      }
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to use wishlist');
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        await fetchUserAssets();
      }
    } catch (err) {
      toast.error('Wishlist update failed');
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, loading, cart, wishlist, 
      refreshUser, addToCart, removeFromCart, toggleWishlist 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
