'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Package, Truck, Calendar, DollarSign, MapPin, ChevronLeft } from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  building?: string;
  houseUnit?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'paypal' | 'cod' | 'paymongo';
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      toast.error('Please login to view your orders.');
      // Redirect to login or home
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error('Failed to fetch orders.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Accessing Order History...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4 text-[var(--foreground)]">Authentication Required</h2>
        <p className="text-[var(--muted)] max-w-md mx-auto mb-8">Please sign in to view your order history.</p>
        <Link href="/login" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all">
          SIGN IN
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 transition-colors duration-300">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight">Your Orders<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--muted)] mt-2 font-medium">Track your recent purchases and their status</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all">
          <ChevronLeft size={16} /> Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-20 text-center shadow-sm">
          <Package size={48} className="mx-auto text-[var(--card-border)] mb-6" />
          <h2 className="text-2xl font-black text-[var(--foreground)] mb-4">No Orders Yet</h2>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-8">It looks like you haven't placed any orders. Start exploring our products!</p>
          <Link href="/" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all">
            BROWSE PRODUCTS
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order._id} className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-center border-b border-(--card-border) pb-4 mb-4">
                <h2 className="text-xl font-black text-[var(--foreground)]">Order #{order._id.slice(-6).toUpperCase()}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                  order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                  order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-[var(--muted)]/10 text-[var(--muted)]'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-black text-[var(--foreground)] mb-3 flex items-center gap-2"><Calendar size={18} className="text-[var(--primary)]" /> Order Date</h3>
                  <p className="text-[var(--muted)] text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--foreground)] mb-3 flex items-center gap-2"><DollarSign size={18} className="text-green-500" /> Total Amount</h3>
                  <p className="text-[var(--foreground)] text-lg font-black">${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-black text-[var(--foreground)] mb-3 flex items-center gap-2"><MapPin size={18} className="text-red-500" /> Shipping To</h3>
                  <p className="text-[var(--muted)] text-sm">
                    {order.shippingAddress.fullName}, {order.shippingAddress.phone}<br/>
                    {order.shippingAddress.houseUnit && `${order.shippingAddress.houseUnit}, `}
                    {order.shippingAddress.building && `${order.shippingAddress.building}, `}
                    {order.shippingAddress.street}<br/>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-(--card-border)">
                <h3 className="text-lg font-black text-[var(--foreground)] mb-3 uppercase tracking-widest text-xs opacity-50">Deployed Components</h3>
                <div className="grid grid-cols-1 gap-4">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center bg-[var(--input)]/50 p-4 rounded-2xl border border-(--card-border) group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--input)] rounded-xl overflow-hidden border border-(--card-border) flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)] opacity-20"><Package size={20} /></div>
                          )}
                        </div>
                        <div>
                          <Link href={`/product/${item.productId}`} className="font-black text-[var(--foreground)] hover:text-[var(--primary)] transition-colors tracking-tight">
                            {item.name}
                          </Link>
                          <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">Qty: {item.quantity} × ${item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-[var(--foreground)] text-sm">${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        {order.status === 'delivered' && (
                          <Link 
                            href={`/product/${item.productId}?tab=reviews`}
                            className="bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white dark:hover:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Review Component
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
