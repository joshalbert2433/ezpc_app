'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Package, 
  Truck, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Edit2, 
  Loader2, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Eye,
  CreditCard,
  User as UserIcon,
  ExternalLink
} from 'lucide-react';

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
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'paypal' | 'cod' | 'paymongo';
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'admin') {
        toast.error('Access Denied: Admins only.');
      } else {
        fetchAllOrders();
      }
    }
  }, [user, authLoading]);

  const fetchAllOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
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

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Order ${orderId.slice(-6).toUpperCase()} updated to ${newStatus}.`);
        fetchAllOrders();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to update order status.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Accessing Orders Log...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4 text-[var(--foreground)] uppercase tracking-tighter">Admin Access Required</h2>
        <p className="text-[var(--muted)] max-w-md mx-auto mb-8">Please login with an administrator account to access this terminal.</p>
        <Link href="/login" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all">
          SIGN IN
        </Link>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const getNextStatus = (current: Order['status']): Order['status'] | null => {
    switch (current) {
      case 'pending': return 'processing';
      case 'processing': return 'shipped';
      case 'shipped': return 'delivered';
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 transition-colors duration-300 pb-20">
      <header>
        <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter">Order Management<span className="text-[var(--primary)]">_</span></h1>
        <p className="text-[var(--muted)] mt-1 font-medium">Fulfill deployment requests and manage logistics flow</p>
      </header>

      {orders.length === 0 ? (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-20 text-center shadow-sm">
          <Package size={48} className="mx-auto text-[var(--card-border)] mb-6" />
          <h2 className="text-2xl font-black text-[var(--foreground)] mb-4 uppercase tracking-tight">No Active Orders</h2>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-8">No order requests have been received in the current cycle.</p>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-(--card-border) bg-[var(--input)]/50">
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">ID / Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Customer</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Valuation</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Method</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  const nextStatus = getNextStatus(order.status);
                  
                  return (
                    <React.Fragment key={order._id}>
                      <tr className={`hover:bg-[var(--input)]/30 transition-colors group ${isExpanded ? 'bg-[var(--input)]/50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                              className="p-1 hover:text-[var(--primary)] transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <div>
                              <span className="font-black text-[var(--foreground)] text-sm tracking-tight">#{order._id.slice(-6).toUpperCase()}</span>
                              <p className="text-[9px] text-[var(--muted)] font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-[var(--foreground)] text-sm">{order.shippingAddress.fullName}</p>
                          <div className="flex items-center gap-1 text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest">
                            <UserIcon size={10} /> {order.userId.slice(-6)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-[var(--foreground)] text-sm">${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[var(--muted)]">
                            <CreditCard size={12} className="text-[var(--primary)]/50" />
                            {order.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {nextStatus && (
                              <button 
                                onClick={() => updateOrderStatus(order._id, nextStatus)}
                                disabled={updatingOrderId === order._id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white dark:hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                              >
                                {updatingOrderId === order._id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                Mark {nextStatus}
                              </button>
                            )}
                            <button 
                              onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                              className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input)] rounded-lg transition-all"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr className="bg-[var(--input)]/20">
                          <td colSpan={6} className="px-12 py-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in slide-in-from-top-2 duration-300">
                              {/* Order Items */}
                              <div className="lg:col-span-2 space-y-4">
                                <h4 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                  <Package size={14} /> System Components Overview
                                </h4>
                                <div className="space-y-3">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-[var(--card)] p-4 rounded-2xl border border-(--card-border)">
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--input)] rounded-xl overflow-hidden border border-(--card-border) flex-shrink-0">
                                          {item.image ? (
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)] opacity-20"><Package size={20} /></div>
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-black text-[var(--foreground)] text-sm tracking-tight">{item.name}</p>
                                          <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">Qty: {item.quantity} × ${item.price.toLocaleString()}</p>
                                        </div>
                                      </div>
                                      <span className="font-black text-[var(--foreground)] text-sm">${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Logistics Details */}
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <MapPin size={14} /> Logistics Endpoint
                                  </h4>
                                  <div className="bg-[var(--card)] p-6 rounded-2xl border border-(--card-border) space-y-2">
                                    <p className="font-black text-[var(--foreground)] text-sm tracking-tight">{order.shippingAddress.fullName}</p>
                                    <p className="text-[10px] text-[var(--muted)] font-bold tracking-widest">{order.shippingAddress.phone}</p>
                                    <p className="text-[11px] text-[var(--muted)] leading-relaxed font-medium mt-3">
                                      {order.shippingAddress.houseUnit && `${order.shippingAddress.houseUnit}, `}
                                      {order.shippingAddress.building && `${order.shippingAddress.building}, `}
                                      {order.shippingAddress.street}<br/>
                                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-4">Operations Terminal</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                      onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                    >
                                      <X size={12} /> Cancel Order
                                    </button>
                                    <Link 
                                      href={`/admin/orders/manifest/${order._id}`}
                                      className="flex items-center justify-center gap-2 py-3 bg-[var(--input)] text-[var(--muted)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-[var(--primary)] transition-all border border-(--card-border)"
                                    >
                                      <ExternalLink size={12} /> Export Manifest
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
