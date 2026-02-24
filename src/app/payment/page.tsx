'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { ArrowLeft, Package, ShieldCheck, MapPin, CheckCircle, Truck, CreditCard, Loader2 } from 'lucide-react';

export default function PaymentPage() {
  const { user, cart, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get('method');

  // Get selected item IDs from URL
  const selectedItemIdsString = searchParams.get('selectedItems');
  const selectedItemIds = selectedItemIdsString ? JSON.parse(decodeURIComponent(selectedItemIdsString)) : [];

  // Filter cart based on selected items
  const filteredCart = cart.filter(item => selectedItemIds.includes(item.product?._id || ''));

  const [loading, setLoading] = useState(true);
  const [paymongoProcessing, setPaymongoProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
  const paymongoPublicKey = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY || 'pk_test_YOUR_PUBLIC_KEY';

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please login to proceed with payment.');
        router.push('/login');
      } else if (filteredCart.length === 0) { // Check filteredCart
        toast.error('No items selected for payment.');
        router.push('/cart'); // Redirect to cart if no items selected
      } else {
        fetchDefaultAddress();
      }
    }
  }, [user, filteredCart, authLoading, router]); // Dependency on filteredCart

  const fetchDefaultAddress = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        const addresses = await res.json();
        const defaultAddr = addresses.find((addr: any) => addr.isDefault);
        setSelectedAddress(defaultAddr);
      } else {
        toast.error('Failed to load addresses.');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Error loading addresses.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = filteredCart.reduce((acc, curr) => acc + (curr.product?.price * curr.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  // PayPal specific functions
  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: total.toFixed(2),
            currency_code: 'USD',
          },
          items: filteredCart.map((item: any) => ({ // Use filteredCart
            name: item.product?.name,
            quantity: item.quantity,
            unit_amount: {
              value: item.product?.price.toFixed(2),
              currency_code: 'USD',
            },
          })),
        },
      ],
    });
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture(); // Capture the payment
      
      // Construct order data using filteredCart
      const orderData = {
        items: filteredCart.map((item: any) => ({
          productId: item.product?._id,
          name: item.product?.name,
          price: item.product?.price,
          quantity: item.quantity,
          image: item.product?.images?.[0], 
        })),
        shippingAddress: selectedAddress,
        paymentMethod: 'paypal',
        paymentResult: {
          id: details.id,
          status: details.status,
          update_time: details.update_time,
          email_address: details.payer.email_address,
        },
        totalAmount: total,
      };

      // Call your backend API to place the order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (orderRes.ok) {
        toast.success('Payment successful! Your order has been placed.');
        router.push('/order-confirmation');
      } else {
        const errorData = await orderRes.json();
        toast.error(errorData.message || 'Failed to place order after payment.');
      }
    } catch (error) {
      console.error('PayPal onApprove error:', error);
      toast.error('Payment could not be processed or order could not be placed.');
    }
  };

  const onError = (err: any) => {
    console.error('PayPal onError:', err);
    toast.error('An error occurred with PayPal payment.');
  };

  const onCancel = (data: any) => {
    toast('PayPal payment cancelled.', { icon: '👋' });
  };

  // COD specific function
  const handlePlaceOrderCOD = async () => {
    // Construct order data using filteredCart
    const orderData = {
      items: filteredCart.map((item: any) => ({
        productId: item.product?._id,
        name: item.product?.name,
        price: item.product?.price,
        quantity: item.quantity,
        image: item.product?.images?.[0], 
      })),
      shippingAddress: selectedAddress,
      paymentMethod: 'cod',
      totalAmount: total,
    };

    try {
      // Call your backend API to place the order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (orderRes.ok) {
        toast.success('Order placed successfully! Pay with cash on delivery.');
        router.push('/order-confirmation');
      } else {
        const errorData = await orderRes.json();
        toast.error(errorData.message || 'Failed to place COD order.');
      }
    } catch (error) {
      console.error('Error placing COD order:', error);
      toast.error('An error occurred while placing COD order.');
    }
  };

  // PayMongo specific function
  const handlePayWithPaymongo = async () => {
    setPaymongoProcessing(true);
    try {
      const res = await fetch('/api/paymongo/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(total * 100), // PayMongo expects amount in centavos
          returnUrl: `${window.location.origin}/order-confirmation?status=paymongo_success&totalAmount=${total}&items=${encodeURIComponent(JSON.stringify(filteredCart.map((item: any) => ({
            productId: item.product?._id,
            name: item.product?.name,
            price: item.product?.price,
            quantity: item.quantity,
            image: item.product?.images?.[0],
          })) ))}&shippingAddress=${encodeURIComponent(JSON.stringify(selectedAddress))}`,
          description: `Order from EZPC - Total: ${total.toFixed(2)}`
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.nextActionUrl) {
          router.push(data.nextActionUrl); // Redirect to PayMongo hosted page
        } else {
          toast.error('Failed to get PayMongo redirect URL.');
        }
      } else {
        toast.error(data.message || 'Failed to initiate PayMongo payment.');
      }
    } catch (error) {
      console.error('Error initiating PayMongo payment:', error);
      toast.error('An error occurred while connecting to PayMongo.');
    } finally {
      setPaymongoProcessing(false);
    }
  };


  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Finalizing Payment Selection...</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
      <main className="max-w-7xl mx-auto px-6 py-12 transition-colors duration-300">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight">Payment<span className="text-[var(--primary)]">_</span></h1>
            <p className="text-[var(--muted)] mt-2 font-medium">Complete your payment securely</p>
          </div>
          <Link href="/checkout" className="flex items-center gap-2 text-sm font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all">
            <ArrowLeft size={16} /> Back to Order Confirmation
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Shipping Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-black text-[var(--foreground)] mb-6 uppercase tracking-widest flex items-center gap-3">
                <MapPin size={24} className="text-[var(--primary)]" /> Shipping Address
              </h2>
              {selectedAddress ? (
                <div className="space-y-2">
                  <p className="font-black text-[var(--foreground)] text-lg">{selectedAddress.fullName}</p>
                  <p className="text-[var(--muted)] text-sm">
                    {selectedAddress.houseUnit && `${selectedAddress.houseUnit}, `}
                    {selectedAddress.building && `${selectedAddress.building}, `}
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                  </p>
                  <Link href="/addresses" className="text-[var(--primary)] hover:underline text-sm font-medium">
                    Change Address
                  </Link>
                </div>
              ) : (
                <div className="text-center p-8 bg-[var(--input)] rounded-2xl border border-[var(--card-border)]">
                  <p className="text-[var(--muted)] mb-4">No default shipping address selected.</p>
                  <Link href="/addresses" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2 rounded-xl text-sm font-bold transition-all">
                    Add/Select Address
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Method Details */}
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-black text-[var(--foreground)] mb-6 uppercase tracking-widest flex items-center gap-3">
                <ShieldCheck size={24} className="text-[var(--primary)]" /> Payment Details
              </h2>
              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <div className="bg-[var(--input)] border border-[var(--card-border)] rounded-2xl p-5">
                    <h3 className="text-lg font-black text-[var(--foreground)] mb-2">Pay with PayPal</h3>
                    <p className="text-[var(--muted)] text-sm mb-4">You will be redirected to PayPal to complete your purchase.</p>
                    <div className="w-full">
                      <PayPalButtons 
                        style={{ layout: "vertical", color: "blue", shape: "pill", label: "pay" }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={onError}
                        onCancel={onCancel}
                      />
                    </div>
                  </div>
                </div>
              )}
              {paymentMethod === 'cod' && (
                <div className="space-y-4">
                  <div className="bg-[var(--input)] border border-[var(--card-border)] rounded-2xl p-5 text-center">
                    <Truck size={48} className="mx-auto text-[var(--primary)] mb-4" />
                    <h3 className="text-lg font-black text-[var(--foreground)] mb-2">Cash on Delivery</h3>
                    <p className="text-[var(--muted)] text-sm mb-4">Your order will be delivered to your address, and you can pay with cash upon arrival.</p>
                    <button 
                      onClick={handlePlaceOrderCOD}
                      className="w-full bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-3 rounded-xl transition-all active:scale-95 shadow-lg uppercase tracking-widest text-sm"
                    >
                      Place Order (COD)
                    </button>
                  </div>
                </div>
              )}
              {paymentMethod === 'paymongo' && (
                <div className="space-y-4">
                  <div className="bg-[var(--input)] border border-[var(--card-border)] rounded-2xl p-5 text-center">
                    <CreditCard size={48} className="mx-auto text-[var(--primary)] mb-4" />
                    <h3 className="text-lg font-black text-[var(--foreground)] mb-2">Pay with PayMongo</h3>
                    <p className="text-[var(--muted)] text-sm mb-4">You will be redirected to PayMongo to complete your payment securely.</p>
                    <button 
                      onClick={handlePayWithPaymongo}
                      disabled={paymongoProcessing}
                      className="w-full bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-3 rounded-xl transition-all active:scale-95 shadow-lg uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {paymongoProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} /> Processing...
                        </>
                      ) : (
                        'Proceed to PayMongo'
                      )}
                    </button>
                  </div>
                </div>
              )}
              {!paymentMethod && (
                <div className="text-center p-8 bg-[var(--input)] rounded-2xl border border-[var(--card-border)]">
                  <p className="text-[var(--muted)] mb-4">No payment method selected. Please go back to choose one.</p>
                  <Link href="/checkout" className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-2 rounded-xl text-sm font-bold transition-all">
                    Choose Payment Method
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 shadow-xl sticky top-32">
              <h2 className="text-xl font-black text-[var(--foreground)] mb-6 uppercase tracking-widest">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                {filteredCart.map((item: any) => ( // Use filteredCart
                  <div key={item.product?._id} className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">{item.product?.name} ({item.quantity})</span>
                    <span className="text-[var(--foreground)] font-black">${(item.product?.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm border-t border-[var(--card-border)] pt-4">
                  <span className="text-[var(--muted)] font-bold">Subtotal</span>
                  <span className="text-[var(--foreground)] font-black">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)] font-bold">Estimated Tax (5%)</span>
                  <span className="text-[var(--foreground)] font-black">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)] font-bold">Shipping</span>
                  <span className="text-green-500 font-black uppercase">Free</span>
                </div>
                <div className="border-t border-[var(--card-border)] pt-4 mt-4 flex justify-between">
                  <span className="text-[var(--foreground)] font-black uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-[var(--primary)] drop-shadow-sm">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PayPalScriptProvider>
  );
}
