'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Package, Truck, Calendar, DollarSign, MapPin, ChevronLeft, Download, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      toast.error('Session required to access logs.');
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error('Failed to fetch transaction logs.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading logs.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-[10px] text-black dark:text-white">Synchronizing Transaction History...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-black mb-4 text-[var(--foreground)] uppercase text-black dark:text-white">Authentication Required</h2>
        <p className="text-xs text-[var(--muted)] max-w-md mx-auto mb-8 uppercase font-bold tracking-tight">Please authorize your session to access procurement logs.</p>
        <Link href="/login" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2.5 rounded-xl font-black transition-all text-xs uppercase tracking-widest">
          Authorize Session
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase text-black dark:text-white">Transaction Logs<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest mt-1">Archive of hardware procurement cycles</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all">
          <ArrowLeft size={14} /> Resume Search
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-16 text-center shadow-sm">
          <Package size={40} className="mx-auto text-[var(--card-border)] mb-4" />
          <h2 className="text-xl font-black text-[var(--foreground)] mb-2 uppercase text-black dark:text-white">No Logs Detected</h2>
          <p className="text-xs text-[var(--muted)] max-w-xs mx-auto mb-6">No previous hardware procurement records found in your database.</p>
          <Link href="/" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2.5 rounded-xl font-black transition-all text-xs uppercase tracking-widest">
            Execute Initial Search
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-6 shadow-sm group hover:border-[var(--primary)]/30 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-(--card-border) pb-4 mb-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-sm font-black text-[var(--foreground)] uppercase text-black dark:text-white">Log #{order._id.slice(-6).toUpperCase()}</h2>
                  <Link 
                    href={`/orders/invoice/${order._id}`}
                    className="flex items-center gap-1.5 text-[9px] font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all bg-[var(--primary)]/5 px-2.5 py-1 rounded-lg border border-[var(--primary)]/10"
                  >
                    <FileText size={12} /> Manifest
                  </Link>
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest px-2 py-1 bg-[var(--input)] rounded-lg">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${
                    order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-[var(--muted)]/10 text-[var(--muted)] border-(--card-border)'
                  }`}>
                    Status: {order.status}
                  </span>
                  <p className="text-base font-black text-[var(--primary)] tracking-tighter">${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                <div className="md:col-span-4 space-y-4">
                  <div>
                    <h3 className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"><MapPin size={12} className="text-red-500" /> Dispatch Destination</h3>
                    <p className="text-[11px] font-medium leading-relaxed text-[var(--foreground)] text-black dark:text-white">
                      {order.shippingAddress.fullName}<br/>
                      {order.shippingAddress.phone}<br/>
                      {order.shippingAddress.houseUnit && `${order.shippingAddress.houseUnit}, `}
                      {order.shippingAddress.building && `${order.shippingAddress.building}, `}
                      {order.shippingAddress.street}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <h3 className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"><Package size={12} className="text-[var(--primary)]" /> Synchronized Units</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center bg-[var(--input)]/30 p-3 rounded-xl border border-(--card-border) group/item">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-[var(--input)] rounded-lg overflow-hidden border border-(--card-border) flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover transition-transform group-hover/item:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--muted)] opacity-20"><Package size={16} /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/product/${item.productId}`} className="text-[11px] font-black text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate uppercase block text-black dark:text-white">
                              {item.name}
                            </Link>
                            <p className="text-[8px] text-[var(--muted)] font-black uppercase tracking-widest">Qty: {item.quantity} × ${item.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-black text-[var(--foreground)] text-[11px] text-black dark:text-white">${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          {order.status === 'delivered' && (
                            <Link 
                              href={`/product/${item.productId}?tab=reviews`}
                              className="bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white dark:hover:text-black px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                            >
                              Log Review
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
