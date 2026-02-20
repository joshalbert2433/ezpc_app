'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Check, ArrowLeft, Home, Briefcase, Globe, Loader2, X, Navigation, Building2, HomeIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-[var(--input)] rounded-2xl animate-pulse flex items-center justify-center text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">Initializing Sat-Link...</div>
});

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  building?: string;
  houseUnit?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      toast.error('Failed to sync logistical points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId, isDefault: true })
      });
      if (res.ok) {
        toast.success('Primary logistics point updated');
        fetchAddresses();
      }
    } catch (err) {
      toast.error('Protocol failure');
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Permanently wipe this coordinate?')) return;
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId })
      });
      if (res.ok) {
        toast.success('Logistics point purged');
        fetchAddresses();
      }
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Accessing Logistics Terminal...</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 transition-colors duration-300">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight uppercase">Logistic Points<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--muted)] mt-2 font-medium">Manage delivery coordinates for hardware deployment</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Return to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <button 
          onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
          className="group border-2 border-dashed border-[var(--card-border)] hover:border-[var(--primary)]/50 rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-4 bg-[var(--card)]/30 hover:bg-[var(--primary)]/5 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-[var(--input)] flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--primary)] group-hover:scale-110 transition-all">
            <Plus size={24} />
          </div>
          <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--foreground)]">Initialize New Coordinate</span>
        </button>

        {addresses.map((addr) => (
          <div 
            key={addr._id} 
            className={`relative bg-[var(--card)] border rounded-3xl p-8 transition-all shadow-sm flex flex-col md:flex-row md:items-center gap-8 ${addr.isDefault ? 'border-[var(--primary)] shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-[var(--card-border)] hover:border-[var(--muted)]'}`}
          >
            {addr.isDefault && (
              <div className="absolute top-4 right-8 flex items-center gap-1.5 bg-[var(--primary)] text-white dark:text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                <Check size={10} /> Active Primary
              </div>
            )}

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--input)] text-[var(--muted)]'}`}>
              {addr.label.toLowerCase() === 'home' ? <Home size={28} /> : 
               addr.label.toLowerCase() === 'office' ? <Briefcase size={28} /> : <Globe size={28} />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-[var(--foreground)] uppercase text-lg tracking-tight">{addr.label}</h3>
              </div>
              <p className="text-sm font-bold text-[var(--foreground)]">{addr.fullName} <span className="text-[var(--muted)] font-medium ml-2">• {addr.phone}</span></p>
              <p className="text-sm text-[var(--muted)] leading-relaxed font-medium mt-2">
                {addr.houseUnit && <span className="text-[var(--foreground)] font-bold">{addr.houseUnit}, </span>}
                {addr.building && <span className="text-[var(--foreground)] font-bold">{addr.building}</span>}
                {(addr.houseUnit || addr.building) && <br />}
                {addr.street}<br />
                {addr.city}, {addr.state} {addr.zipCode}
              </p>
            </div>

            <div className="flex md:flex-col gap-2 shrink-0">
              {!addr.isDefault && (
                <button 
                  onClick={() => handleSetDefault(addr._id)}
                  className="px-4 py-2.5 rounded-xl bg-[var(--input)] text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 text-[10px] font-black uppercase transition-all border border-[var(--card-border)]"
                >
                  Set Primary
                </button>
              )}
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingAddress(addr); setIsModalOpen(true); }}
                  className="p-3 rounded-xl bg-[var(--input)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--card-border)] transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(addr._id)}
                  className="p-3 rounded-xl bg-[var(--input)] text-[var(--muted)] hover:text-red-500 border border-[var(--card-border)] transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AddressModal 
          address={editingAddress} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchAddresses(); }} 
        />
      )}
    </main>
  );
}

function AddressModal({ address, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [useMap, setUseMap] = useState(false);
  const [formData, setFormData] = useState({
    label: address?.label || 'Home',
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    building: address?.building || '',
    houseUnit: address?.houseUnit || '',
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.zipCode || '',
    isDefault: address?.isDefault || false,
  });

  const handleLocationPin = (lat: number, lng: number, addressDetails: any) => {
    setFormData(prev => ({
      ...prev,
      ...addressDetails
    }));
    toast.success('Coordinates synchronized');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const method = address ? 'PUT' : 'POST';
    const body = address ? { ...formData, addressId: address._id } : formData;

    try {
      const res = await fetch('/api/user/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(address ? 'Coordinate updated' : 'Coordinate initialized');
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Transmission failure');
      }
    } catch (err) {
      toast.error('Fatal error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--card)] border border-[var(--card-border)] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)] bg-[var(--input)]/30 shrink-0">
          <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tighter flex items-center gap-2">
            <MapPin className="text-[var(--primary)]" size={20} />
            {address ? 'Edit Coordinate' : 'Initialize Coordinate'}
          </h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] p-2">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center bg-[var(--input)] p-4 rounded-2xl border border-[var(--card-border)] mb-2">
            <div className="flex items-center gap-3">
              <Navigation className="text-[var(--primary)]" size={20} />
              <div>
                <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Pinpoint Location</p>
                <p className="text-[9px] text-[var(--muted)] uppercase font-bold">Use satellite data to auto-fill address</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setUseMap(!useMap)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${useMap ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--primary)] text-white dark:text-black shadow-lg shadow-[var(--primary)]/20 hover:opacity-90'}`}
            >
              {useMap ? 'Abort Satellite' : 'Open Map'}
            </button>
          </div>

          {useMap && (
            <div className="animate-in zoom-in-95 duration-300 mb-6">
              <MapPicker onLocationSelect={handleLocationPin} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Location Identity (Label)</label>
              <div className="grid grid-cols-3 gap-2">
                {['Home', 'Office', 'Other'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setFormData({...formData, label: l})}
                    className={`py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      formData.label === l 
                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white dark:text-black shadow-lg shadow-[var(--primary)]/20' 
                        : 'bg-[var(--input)] border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-full md:col-span-1">
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Building / Tower</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
                <input placeholder="e.g. Cyber Tower" className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl pl-10 pr-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none font-bold text-sm" 
                  value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} />
              </div>
            </div>

            <div className="col-span-full md:col-span-1">
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">House / Unit No.</label>
              <div className="relative">
                <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
                <input placeholder="e.g. Unit 1203" className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl pl-10 pr-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none font-bold text-sm" 
                  value={formData.houseUnit} onChange={e => setFormData({...formData, houseUnit: e.target.value})} />
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Recipient Name</label>
              <input required className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none font-bold text-sm" 
                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>

            <div className="col-span-full">
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Comms Number (Phone)</label>
              <input required className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none font-bold text-sm" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div className="col-span-full">
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Street Address</label>
              <input required className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none font-bold text-sm" 
                value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">City Unit</label>
              <input required className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none font-bold text-sm" 
                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">State / Province</label>
              <input required className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none font-bold text-sm" 
                value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>

            <div className="col-span-full">
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Zip Code</label>
              <input required className="w-full bg-[var(--input)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none font-bold text-sm" 
                value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="hidden" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} />
            <div className={`w-5 h-5 border rounded-lg flex items-center justify-center transition-all ${formData.isDefault ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--card-border)] bg-[var(--input)] group-hover:border-[var(--muted)]'}`}>
              {formData.isDefault && <Check size={14} className="text-white dark:text-black" />}
            </div>
            <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest group-hover:text-[var(--foreground)] transition-colors">Set as Primary Logistics Point</span>
          </label>

          <div className="flex gap-4 pt-4 border-t border-[var(--card-border)]">
            <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl bg-[var(--input)] text-[var(--muted)] font-black uppercase text-[10px] tracking-widest hover:bg-[var(--card-border)] transition-all border border-[var(--card-border)]">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-[var(--primary)]/20 uppercase text-[10px] tracking-[0.2em]">
              {loading ? 'Transmitting...' : address ? 'Overwrite Data' : 'Execute Creation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
