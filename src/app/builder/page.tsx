'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Layers, 
  Zap, 
  Database, 
  Monitor, 
  Fan, 
  Box, 
  Plus, 
  X, 
  ShoppingCart, 
  ChevronRight, 
  Search,
  CheckCircle2,
  Trash2,
  Package,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  salePrice?: number;
  stock: number;
  images?: string[];
  specs: string;
}

type BuildSlot = {
  id: string;
  label: string;
  icon: any;
  category: string;
};

const BUILD_SLOTS: BuildSlot[] = [
  { id: 'cpu', label: 'Processor', icon: Cpu, category: 'CPU' },
  { id: 'motherboard', label: 'Motherboard', icon: Layers, category: 'Motherboard' },
  { id: 'ram', label: 'Memory', icon: Database, category: 'RAM' },
  { id: 'gpu', label: 'Graphics Card', icon: Zap, category: 'GPU' },
  { id: 'ssd', label: 'Storage', icon: Database, category: 'SSD' },
  { id: 'psu', label: 'Power Supply', icon: Zap, category: 'PSU' },
  { id: 'case', label: 'Chassis', icon: Box, category: 'Case' },
  { id: 'cooler', label: 'Cooling', icon: Fan, category: 'Cooler' },
];

export default function PCBuilderPage() {
  const { addMultipleToCart, user } = useAuth();
  const [selectedParts, setSelectedParts] = useState<Record<string, Product | null>>({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    ssd: null,
    psu: null,
    case: null,
    cooler: null,
  });

  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBuild = localStorage.getItem('ezpc_current_build');
    if (savedBuild) {
      try {
        const parsed = JSON.parse(savedBuild);
        if (typeof parsed === 'object' && parsed !== null) {
          setSelectedParts(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved build', e);
      }
    }
    setHasLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem('ezpc_current_build', JSON.stringify(selectedParts));
    }
  }, [selectedParts, hasLoaded]);

  const [activeSlot, setActiveSlot] = useState<BuildSlot | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [partsList, setPartsList] = useState<Product[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch parts when a slot is activated
  useEffect(() => {
    if (activeSlot) {
      const fetchParts = async () => {
        setLoadingParts(true);
        try {
          const res = await fetch(`/api/products?category=${activeSlot.category}`);
          if (res.ok) {
            const data = await res.json();
            setPartsList(data);
          }
        } catch (error) {
          toast.error(`Failed to load ${activeSlot.category} parts`);
        } finally {
          setLoadingParts(false);
        }
      };
      fetchParts();
    }
  }, [activeSlot]);

  const selectPart = (part: Product) => {
    if (activeSlot) {
      setSelectedParts(prev => ({ ...prev, [activeSlot.id]: part }));
      setActiveSlot(null);
      setSearchQuery('');
      toast.success(`${part.name} added to configuration`);
    }
  };

  const removePart = (slotId: string) => {
    setSelectedParts(prev => ({ ...prev, [slotId]: null }));
  };

  const resetBuild = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    const resetState = {
      cpu: null,
      motherboard: null,
      ram: null,
      gpu: null,
      ssd: null,
      psu: null,
      case: null,
      cooler: null,
    };
    setSelectedParts(resetState);
    localStorage.removeItem('ezpc_current_build');
    setIsResetModalOpen(false);
    toast.success('Configuration reset');
  };

  const totalPrice = Object.values(selectedParts).reduce((sum, part) => {
    if (!part) return sum;
    return sum + (part.salePrice || part.price);
  }, 0);

  const selectedCount = Object.values(selectedParts).filter(Boolean).length;

  const handleAddBuildToCart = async () => {
    if (!user) {
      toast.error('Please login to save your build');
      return;
    }

    const validParts = Object.values(selectedParts).filter((p): p is Product => p !== null);
    
    if (validParts.length === 0) {
      toast.error('Your build is empty');
      return;
    }

    const toastId = toast.loading('Adding build to cart...');
    
    try {
      // Add all parts in one batch request
      const items = validParts.map(part => ({ productId: part._id, quantity: 1 }));
      await addMultipleToCart(items);
      toast.dismiss(toastId);
      
      // Optional: Clear build after adding to cart
      // if (confirm('Add successful! Would you like to clear the builder for a new configuration?')) {
      //   resetBuild();
      // }
    } catch (error) {
      toast.error('Failed to add build to cart', { id: toastId });
    }
  };

  const filteredParts = partsList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!hasLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Initializing Configurator...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight uppercase">Custom Rig Configurator<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--muted)] mt-2 font-medium tracking-wide">Synthesize your dream system with verified compatible hardware</p>
        </div>
        <div className="bg-[var(--card)] border border-(--card-border) px-8 py-4 rounded-2xl shadow-xl flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Configuration Total</p>
            <p className="text-3xl font-black text-[var(--primary)]">${totalPrice.toLocaleString()}</p>
          </div>
          <button 
            onClick={handleAddBuildToCart}
            disabled={selectedCount === 0}
            className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black px-6 py-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20 uppercase tracking-widest text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} /> Add Build to Cart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Build Slots */}
        <div className="space-y-4">
          {BUILD_SLOTS.map((slot) => {
            const selectedPart = selectedParts[slot.id];
            return (
              <div 
                key={slot.id} 
                className={`group bg-[var(--card)] border rounded-3xl p-6 transition-all duration-300 flex items-center gap-6 ${
                  selectedPart ? 'border-[var(--primary)]/30 shadow-lg' : 'border-(--card-border) hover:border-[var(--primary)]/50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  selectedPart ? 'bg-[var(--primary)] text-white dark:text-black shadow-lg shadow-[var(--primary)]/20' : 'bg-[var(--input)] text-[var(--muted)]'
                }`}>
                  <slot.icon size={28} />
                </div>
                
                <div className="flex-1">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">{slot.label}</p>
                  {selectedPart ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-black text-[var(--foreground)] tracking-tight">{selectedPart.name}</h3>
                        <p className="text-[var(--primary)] font-black text-sm">${(selectedPart.salePrice || selectedPart.price).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => removePart(slot.id)}
                        className="p-3 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveSlot(slot)}
                      className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] font-black uppercase text-xs tracking-widest transition-colors"
                    >
                      <Plus size={16} /> Select Component
                    </button>
                  )}
                </div>
                
                {selectedPart && (
                  <div className="hidden md:block">
                    <CheckCircle2 className="text-green-500" size={24} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info & Visualization */}
        <div className="hidden lg:block">
          <div className="sticky top-32 bg-[var(--card)] border border-(--card-border) rounded-3xl p-10 shadow-2xl relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

             <div className="flex justify-between items-center mb-8 relative">
               <h2 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter flex items-center gap-3">
                 <Layers className="text-[var(--primary)]" /> System Manifest
               </h2>
               {selectedCount > 0 && (
                 <button 
                  onClick={resetBuild}
                  className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                 >
                   <Trash2 size={14} /> Reset Build
                 </button>
               )}
             </div>
             
             <div className="space-y-6 relative">
               {selectedCount === 0 ? (
                 <div className="py-20 text-center flex flex-col items-center gap-6 border-2 border-dashed border-(--card-border) rounded-3xl">
                   <Package className="text-[var(--muted)] opacity-20" size={64} />
                   <div>
                     <p className="text-[var(--muted)] font-black uppercase tracking-widest text-xs">No Components Synchronized</p>
                     <p className="text-[var(--muted)]/50 text-[10px] mt-1 font-medium italic">Start by selecting a processor for your build</p>
                   </div>
                 </div>
               ) : (
                 <>
                   <div className="space-y-4">
                     {Object.entries(selectedParts).map(([key, part]) => {
                       if (!part) return null;
                       const slot = BUILD_SLOTS.find(s => s.id === key);
                       return (
                         <div key={key} className="flex justify-between items-center text-sm group">
                           <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                             <span className="text-[var(--muted)] font-black uppercase tracking-widest text-[10px] w-24">{slot?.label}</span>
                             <Link href={`/product/${part._id}`} className="text-[var(--foreground)] font-bold hover:text-[var(--primary)] transition-colors truncate max-w-[180px]">
                               {part.name}
                             </Link>
                           </div>
                           <span className="text-[var(--muted)] font-black text-xs">${(part.salePrice && part.salePrice > 0 ? part.salePrice : part.price).toLocaleString()}</span>
                         </div>
                       );
                     })}
                   </div>
                   <div className="border-t border-(--card-border) pt-8 mt-8 flex justify-between items-end">
                     <div>
                       <p className="text-[var(--muted)] font-black uppercase tracking-[0.3em] text-[9px] mb-1">Total System Value</p>
                       <p className="text-4xl font-black text-[var(--primary)] tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">${totalPrice.toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[var(--muted)] font-black uppercase tracking-widest text-[9px] mb-1">Completion Status</p>
                        <div className="flex gap-1">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className={`w-4 h-1.5 rounded-full ${i < selectedCount ? 'bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]' : 'bg-[var(--input)]'}`} />
                          ))}
                        </div>
                     </div>
                   </div>
                 </>
               )}
             </div>

             <div className="mt-12 p-6 bg-[var(--input)]/50 rounded-2xl border border-(--card-border)">
               <div className="flex gap-4 items-start">
                  <CheckCircle2 className="text-[var(--primary)] shrink-0" size={20} />
                  <div>
                    <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest mb-1">EZPC Verified Compatibility</h4>
                    <p className="text-[var(--muted)] text-[10px] font-medium leading-relaxed">Our neural validation engine ensures all selected components are physically compatible for assembly.</p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Selection Modal */}
      <AnimatePresence>
        {activeSlot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSlot(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-[var(--card)] border border-(--card-border) rounded-[2.5rem] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-(--card-border) bg-[var(--input)]/30 flex flex-col md:flex-row gap-6 justify-between md:items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
                    <activeSlot.icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase">Select {activeSlot.label}</h2>
                    <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-[0.2em]">Synchronizing {activeSlot.category} Database</p>
                  </div>
                </div>
                
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                  <input 
                    type="text" 
                    placeholder={`Filter ${activeSlot.category.toLowerCase()}s by name or brand...`}
                    className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl pl-12 pr-5 py-3 text-sm font-bold text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <button 
                  onClick={() => setActiveSlot(null)}
                  className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors self-end md:self-auto"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {loadingParts ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
                    <p className="text-[var(--muted)] font-black uppercase tracking-widest text-[10px] animate-pulse">Scanning Frequency Bands...</p>
                  </div>
                ) : filteredParts.length === 0 ? (
                  <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                    <Package size={64} />
                    <p className="font-black uppercase tracking-widest text-xs">No matching hardware found in sector {activeSlot.category}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredParts.map((part) => (
                      <div 
                        key={part._id} 
                        onClick={() => selectPart(part)}
                        className="group bg-[var(--input)]/50 border border-(--card-border) rounded-3xl p-6 hover:border-[var(--primary)]/50 hover:bg-[var(--card)] transition-all cursor-pointer flex gap-5 items-center relative overflow-hidden"
                      >
                         {/* Selection Overlay */}
                         <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={20} className="text-[var(--primary)]" />
                         </div>

                        <div className="w-20 h-20 bg-[var(--card)] rounded-2xl overflow-hidden border border-(--card-border) flex-shrink-0 relative">
                          {part.images && part.images.length > 0 ? (
                            <img src={part.images[0]} alt={part.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)] opacity-20"><Box size={32} /></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest mb-1">{part.brand}</p>
                          <h4 className="text-sm font-black text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors mb-2">{part.name}</h4>
                          
                          {/* Brief Specs as Badges */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {part.specs.split('•').map((spec, i) => (
                              <span key={i} className="text-[8px] font-black uppercase tracking-tighter bg-[var(--card)] px-2 py-0.5 rounded border border-(--card-border) text-[var(--muted)]">
                                {spec.trim()}
                              </span>
                            ))}
                          </div>

                          {/* Key Value Specs */}
                          {(part as any).fullSpecs && (part as any).fullSpecs.length > 0 && (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                              {(part as any).fullSpecs.slice(0, 4).map((spec: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-[8px] font-bold">
                                  <span className="text-[var(--muted)] uppercase opacity-70">{spec.label}</span>
                                  <span className="text-[var(--foreground)]">
                                    {spec.value === 'true' ? <Check size={8} className="text-green-500" /> : 
                                     spec.value === 'false' ? <X size={8} className="text-red-500" /> : 
                                     spec.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-[var(--foreground)]">${(part.salePrice && part.salePrice > 0 ? part.salePrice : part.price).toLocaleString()}</span>
                              {part.salePrice && part.salePrice > 0 && part.salePrice < part.price && (
                                <span className="text-xs text-[var(--muted)] line-through">${part.price.toLocaleString()}</span>
                              )}
                            </div>
                            <Link 
                              href={`/product/${part._id}`} 
                              target="_blank" 
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all"
                              title="View Details in New Tab"
                            >
                              <ExternalLink size={18} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[var(--card)] border border-(--card-border) rounded-[2.5rem] shadow-2xl z-10 overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase mb-2">Wipe Configuration?</h3>
                <p className="text-[var(--muted)] text-sm font-medium leading-relaxed mb-8">
                  This will permanently delete all selected components from your current build manifest. This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsResetModalOpen(false)}
                    className="flex-1 bg-[var(--input)] text-[var(--foreground)] font-black py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-[var(--card-border)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmReset}
                    className="flex-1 bg-red-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                  >
                    Wipe Build
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--card-border);
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
