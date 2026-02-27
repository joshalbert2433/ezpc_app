'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Home, ShoppingCart, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext'; // To clear cart

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const { refreshUser } = useAuth(); // Function to refresh user data, which includes clearing cart

  const [orderStatus, setOrderStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Processing your order...');

  useEffect(() => {
    const handlePaymongoConfirmation = async () => {
      if (status === 'paymongo_success') {
        try {
          // Extract order details from query parameters
          const totalAmount = parseFloat(searchParams.get('totalAmount') || '0');
          const items = JSON.parse(decodeURIComponent(searchParams.get('items') || '[]'));
          const shippingAddress = JSON.parse(decodeURIComponent(searchParams.get('shippingAddress') || '{}'));

          // Construct order data
          const orderData = {
            items: items.map((item: any) => ({
              productId: item.product?._id,
              name: item.product?.name,
              price: item.product?.price,
              quantity: item.quantity,
              image: item.product?.images?.[0],
            })),
            shippingAddress: shippingAddress,
            paymentMethod: 'paymongo',
            paymentResult: { status: 'paid', // PayMongo provides more details on backend webhook
                             transactionId: 'N/A' // Placeholder, would get from actual PayMongo response
                           }, 
            totalAmount: totalAmount,
          };

          // Call your backend API to place the order
          const orderRes = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });

          if (orderRes.ok) {
            setOrderStatus('success');
            setMessage('Your PayMongo order has been placed successfully!');
            refreshUser(); // Clear cart in frontend
          } else {
            const errorData = await orderRes.json();
            setOrderStatus('failed');
            setMessage(errorData.message || 'Failed to place order after PayMongo payment.');
          }
        } catch (error) {
          console.error('Error processing PayMongo confirmation:', error);
          setOrderStatus('failed');
          setMessage('An unexpected error occurred during order processing.');
        }
      } else if (status === 'success') { // For PayPal and COD
        setOrderStatus('success');
        setMessage('Thank you for your purchase. Your order has been placed successfully and will be processed shortly.');
        refreshUser(); // Clear cart in frontend
      } else {
        // Default success if no specific status is provided (e.g., direct navigation)
        setOrderStatus('success');
        setMessage('Your order has been placed successfully!');
        refreshUser(); // Clear cart in frontend
      }
    };

    handlePaymongoConfirmation();
  }, [status, searchParams, refreshUser]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 text-center transition-colors duration-300">
      <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl p-10 max-w-md w-full shadow-xl space-y-6">
        {orderStatus === 'loading' && (
          <>
            <Loader2 size={64} className="text-[var(--primary)] mx-auto animate-spin" />
            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Processing Order...<span className="text-[var(--primary)]">_</span></h1>
            <p className="text-[var(--muted)]">{message}</p>
          </>
        )}
        {orderStatus === 'success' && (
          <>
            <CheckCircle size={64} className="text-green-500 mx-auto" />
            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Order Confirmed!<span className="text-[var(--primary)]">_</span></h1>
            <p className="text-[var(--muted)]">{message}</p>
          </>
        )}
        {orderStatus === 'failed' && (
          <>
            <XCircle size={64} className="text-red-500 mx-auto" />
            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Order Failed<span className="text-red-500">_</span></h1>
            <p className="text-[var(--muted)]">{message}</p>
          </>
        )}
        
        <div className="flex flex-col gap-4 pt-6 border-t border-(--card-border)">
          <Link href="/" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg uppercase tracking-widest text-sm">
            <Home size={18} /> Continue Shopping
          </Link>
          <Link href="/profile/orders" className="bg-[var(--input)] hover:bg-[var(--card-border)] text-[var(--foreground)] px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm uppercase tracking-widest text-sm">
            <ShoppingCart size={18} /> View Your Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
