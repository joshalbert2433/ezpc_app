'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Printer, Download, ArrowLeft, Package, MapPin, CreditCard, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  items: any[];
  shippingAddress: any;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/user/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          toast.error('Failed to load invoice');
        }
      } catch (err) {
        toast.error('Error fetching order details');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrder();
  }, [id, user, authLoading, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 p-4 md:p-12 print:p-0 print:bg-white">
      {/* Action Bar - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <button 
          onClick={handlePrint}
          className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          <Printer size={16} /> Print to PDF
        </button>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-[2rem] overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="bg-[var(--primary)] p-12 text-white dark:text-black flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={32} strokeWidth={3} />
              <h1 className="text-4xl font-black tracking-tighter">EZPC_</h1>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">Official Sales Invoice</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Receipt</h2>
            <p className="font-bold opacity-80">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="p-12">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-4">Issuer</h3>
              <p className="text-lg font-black text-[var(--foreground)]">EZPC_ Hardware Solutions</p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                123 Neural Pathway, Suite 404<br />
                Cyber City, CC 90210<br />
                support@ezpc.app
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-4">Recipient</h3>
              <p className="text-lg font-black text-[var(--foreground)]">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {order.shippingAddress.houseUnit && `${order.shippingAddress.houseUnit}, `}
                {order.shippingAddress.building && `${order.shippingAddress.building}, `}
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12 py-8 border-y border-neutral-100 dark:border-neutral-800">
            <div>
              <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Date Issued</p>
              <p className="font-bold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Payment Method</p>
              <p className="font-bold uppercase tracking-wider text-sm">{order.paymentMethod}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Status</p>
              <p className="font-bold uppercase text-[var(--primary)]">{order.status}</p>
            </div>
          </div>

          {/* Table */}
          <div className="mb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Description</th>
                  <th className="py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Qty</th>
                  <th className="py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-right">Price</th>
                  <th className="py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {order.items.map((item, i) => (
                  <tr key={i} className="group">
                    <td className="py-6">
                      <p className="font-black text-[var(--foreground)] text-sm">{item.name}</p>
                      <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest mt-1">Component ID: {item.productId.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="py-6 text-center font-bold text-sm">{item.quantity}</td>
                    <td className="py-6 text-right font-bold text-sm">${item.price.toLocaleString()}</td>
                    <td className="py-6 text-right font-black text-sm">${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-8 border-t-4 border-neutral-900 dark:border-neutral-100">
            <div className="w-64 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)] font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="font-bold">${(order.totalAmount / 1.05).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)] font-bold uppercase tracking-widest text-[10px]">Tax (5%)</span>
                <span className="font-bold">${(order.totalAmount - (order.totalAmount / 1.05)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-[var(--foreground)] font-black uppercase tracking-widest text-xs">Total Amount</span>
                <span className="text-3xl font-black text-[var(--primary)] tracking-tighter">${order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-xs text-[var(--muted)] font-medium leading-relaxed italic">
              "Building the future, one component at a time."<br />
              Thank you for choosing EZPC_ Hardware. This is a computer-generated invoice.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
