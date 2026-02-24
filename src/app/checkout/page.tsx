'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, MapPin, CreditCard, DollarSign } from 'lucide-react';

export default function CheckoutPage() {
  const { user, cart, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // Initialize useSearchParams
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('paypal'); // Default to PayPal

  // Get selected item IDs from URL
  const selectedItemIdsString = searchParams.get('selectedItems');
  const selectedItemIds = selectedItemIdsString ? JSON.parse(decodeURIComponent(selectedItemIdsString)) : [];

  // Filter cart based on selected items
  const filteredCart = cart.filter(item => selectedItemIds.includes(item.product?._id || ''));

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please login to proceed to checkout.');
        router.push('/login');
      } else if (filteredCart.length === 0) { // Check filteredCart
        toast.error('No items selected for checkout.');
        router.push('/cart');
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

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address.');
      return;
    }
    // Pass selected items and payment method to the payment page
    router.push(`/payment?method=${selectedPaymentMethod}&selectedItems=${encodeURIComponent(JSON.stringify(selectedItemIds))}`);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Preparing Order Confirmation...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 transition-colors duration-300">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight">Confirm Order<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--muted)] mt-2 font-medium">Review your order and choose a payment method</p>
        </div>
        <Link href="/cart" className="flex items-center gap-2 text-sm font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Order Details & Shipping */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-6 uppercase tracking-widest flex items-center gap-3">
              <Package size={24} className="text-[var(--primary)]" /> Your Items
            </h2>
            <div className="space-y-4">
              {filteredCart.map((item: any) => ( // Use filteredCart
                <div key={item.product?._id} className="flex justify-between items-center text-sm border-b border-[var(--card-border)] pb-2">
                  <div className="flex items-center gap-3">
                    {item.product?.images && item.product.images.length > 0 ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 object-cover rounded-md" />
                    ) : (
                      <div className="w-10 h-10 bg-[var(--input)] rounded-md flex items-center justify-center text-[var(--muted)]"><Package size={16} /></div>
                    )}
                    <div>
                      <p className="font-black text-[var(--foreground)]">{item.product?.name}</p>
                      <p className="text-[var(--muted)] text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-[var(--foreground)]">${(item.product?.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

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
        </div>

        {/* Order Summary & Payment Selection */}
        <div className="space-y-6">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 shadow-xl sticky top-32">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-6 uppercase tracking-widest">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
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

            <h3 className="text-lg font-black text-[var(--foreground)] mb-4 uppercase tracking-widest">Choose Payment Method</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 bg-[var(--input)] border border-[var(--card-border)] rounded-xl p-4 cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="paypal" 
                  checked={selectedPaymentMethod === 'paypal'}
                  onChange={() => setSelectedPaymentMethod('paypal')}
                  className="form-radio text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <CreditCard size={20} className="text-[var(--primary)]" />
                <span className="font-bold text-[var(--foreground)]">PayPal</span>
              </label>
              <label className="flex items-center gap-3 bg-[var(--input)] border border-[var(--card-border)] rounded-xl p-4 cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={selectedPaymentMethod === 'cod'}
                  onChange={() => setSelectedPaymentMethod('cod')}
                  className="form-radio text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <DollarSign size={20} className="text-green-500" />
                <span className="font-bold text-[var(--foreground)]">Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center gap-3 bg-[var(--input)] border border-[var(--card-border)] rounded-xl p-4 cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="paymongo" 
                  checked={selectedPaymentMethod === 'paymongo'}
                  onChange={() => setSelectedPaymentMethod('paymongo')}
                  className="form-radio text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <CreditCard size={20} className="text-[var(--primary)]" />
                <span className="font-bold text-[var(--foreground)]">PayMongo</span>
                <span className="text-xs text-[var(--muted)] ml-auto">(Not yet available)</span>
              </label>
            </div>

            <button 
              onClick={handleProceedToPayment}
              disabled={!selectedAddress || filteredCart.length === 0} // Disable if no address or no items selected
              className="w-full bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
