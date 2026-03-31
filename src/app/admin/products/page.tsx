'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, X, Package, Image as ImageIcon, Trash, Upload, Loader2, Star, Check, Database, Tag, Flame, TrendingUp, Percent, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Pagination from '@/components/Pagination';

interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  salePrice?: number;
  stock: number;
  badge: string;
  specs: string;
  images?: string[];
  description?: string;
  fullSpecs?: { label: string; value: string }[];
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Search and Filtering State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;

  const debouncedSearch = useDebounce(search, 500);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        category: category,
      });
      
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when search or category changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? (Soft deletion)')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product soft-deleted');
        fetchProducts();
      }
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const categories = ["GPU", "CPU", "RAM", "SSD", "PSU", "Case", "Cooler", "Monitor", "Motherboard"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 transition-colors duration-300 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter">Products Catalog<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--foreground-muted)] mt-1 font-medium italic">Command Center: {totalProducts} Units Managed</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20 text-xs uppercase tracking-widest"
        >
          <Plus size={18} /> Add Product
        </button>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-4 items-center bg-[var(--card)] border border-(--card-border) p-4 rounded-2xl shadow-sm">
          <Search className="text-[var(--foreground-muted)]" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, brand, or specs..."
            className="bg-transparent border-none outline-none text-[var(--foreground)] w-full text-sm font-medium placeholder:text-[var(--foreground-muted)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[var(--foreground-muted)] hover:text-[var(--primary)]">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" size={16} />
            <select 
              className="bg-[var(--card)] border border-(--card-border) text-[var(--foreground)] text-xs font-black uppercase tracking-widest rounded-2xl pl-10 pr-10 py-4 outline-none appearance-none cursor-pointer focus:border-[var(--primary)] transition-all min-w-[180px]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-(--card-border) bg-[var(--input)]/50">
                <th className="px-6 py-5 text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">Product Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] text-center">Inventory</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">Price</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                      <p className="text-[var(--foreground-muted)] font-black uppercase text-[10px] tracking-widest">Synchronizing Neural Assets...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Package size={48} className="text-[var(--foreground-muted)]" />
                      <p className="text-[var(--foreground-muted)] font-black uppercase text-[10px] tracking-widest italic">No matching units found in the local cache.</p>
                    </div>
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-[var(--input)]/30 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--input)] rounded-xl flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform overflow-hidden relative border border-(--card-border)">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} />
                        )}
                        {p.badge && (
                          <div className={`absolute top-0 left-0 text-[6px] font-black px-1 rounded-br uppercase ${
                            p.badge === 'sale' ? 'bg-red-500 text-white' : 
                            p.badge === 'hot' ? 'bg-orange-500 text-white' : 
                            'bg-[var(--primary)] text-white dark:text-black'
                          }`}>
                            {p.badge}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[var(--foreground)] text-sm tracking-tight group-hover:text-[var(--primary)] transition-colors uppercase">{p.name}</span>
                        <span className="text-[9px] font-bold text-[var(--foreground-muted)] uppercase tracking-tighter">{p.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                      p.stock <= 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                      p.stock < 5 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                      'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                      {p.stock <= 0 ? 'Empty' : `${p.stock} Units`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${p.badge === 'sale' && p.salePrice ? 'text-xs text-[var(--foreground-muted)] line-through' : 'text-[var(--primary)]'}`}>
                        ${p.price.toLocaleString()}
                      </span>
                      {p.badge === 'sale' && p.salePrice && (
                        <span className="text-red-500 font-black text-sm">
                          ${p.salePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(p)}
                        className="p-2.5 text-[var(--foreground-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-all"
                        title="Edit Unit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="p-2.5 text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Wipe Local Cache"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {isModalOpen && (
        <ProductFormModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [maxImages, setMaxImages] = useState(6);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, index: number | null}>({
    isOpen: false,
    index: null
  });
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'GPU',
    brand: product?.brand || '',
    price: product?.price || 0,
    salePrice: product?.salePrice || 0,
    stock: product?.stock || 0,
    badge: product?.badge || '',
    specs: product?.specs || '',
    description: product?.description || '',
    images: Array.isArray(product?.images) ? [...product.images] : [],
    fullSpecs: Array.isArray(product?.fullSpecs) ? [...product.fullSpecs] : [],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'GPU',
        brand: product.brand || '',
        price: product.price || 0,
        salePrice: product.salePrice || 0,
        stock: product.stock || 0,
        badge: product.badge || '',
        specs: product.specs || '',
        description: product.description || '',
        images: Array.isArray(product.images) ? [...product.images] : [],
        fullSpecs: Array.isArray(product.fullSpecs) ? [...product.fullSpecs] : [],
      });
    }
  }, [product]);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setMaxImages(data.maxProductImages));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > maxImages) {
      toast.error(`Maximum limit of ${maxImages} images reached`);
      return;
    }

    setIsUploading(true);
    const newImageUrls = [...formData.images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (res.ok) {
          const data = await res.json();
          newImageUrls.push(data.url);
        }
      }
      setFormData({ ...formData, images: newImageUrls });
      toast.success('Assets ready');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerDeleteConfirm = (index: number) => {
    setDeleteModal({ isOpen: true, index });
  };

  const handleRemoveImage = () => {
    if (deleteModal.index !== null) {
      const newImages = formData.images.filter((_: any, i: number) => i !== deleteModal.index);
      setFormData({ ...formData, images: newImages });
      setDeleteModal({ isOpen: false, index: null });
      toast.success('Asset removed');
    }
  };

  const setMainImage = (index: number) => {
    const newImages = [...formData.images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setFormData({ ...formData, images: newImages });
    toast.success('Primary updated');
  };

  const addSpec = () => {
    setFormData({
      ...formData,
      fullSpecs: [...formData.fullSpecs, { label: '', value: '' }]
    });
  };

  const removeSpec = (index: number) => {
    const newSpecs = [...formData.fullSpecs];
    newSpecs.splice(index, 1);
    setFormData({ ...formData, fullSpecs: newSpecs });
  };

  const updateSpec = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...formData.fullSpecs];
    newSpecs[index][field] = value;
    setFormData({ ...formData, fullSpecs: newSpecs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = product ? `/api/products/${product._id}` : '/api/products';
    const method = product ? 'PUT' : 'POST';

    const cleanedData = {
      ...formData,
      images: formData.images.filter((img: string) => img.trim() !== '')
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (res.ok) {
        toast.success(product ? 'Data updated' : 'Created successfully');
        onSuccess();
      } else {
        toast.error('Save failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[var(--card)] border border-(--card-border) w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-(--card-border) shrink-0 bg-[var(--input)]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tighter leading-none">
                  {product ? 'Update Unit' : 'New Unit Entry'}
                </h2>
                <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mt-1">
                  {product ? `ID: ${product._id}` : 'Manual System Injection'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors p-2 hover:bg-[var(--input)] rounded-xl">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="overflow-hidden flex flex-col">
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Primary Data */}
                <div className="lg:col-span-5 space-y-8">
                  <section>
                    <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Database size={12} /> Core Identification
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1.5 ml-1">Product Name</label>
                        <input 
                          required
                          placeholder="e.g. RTX 5090 Ti"
                          className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all font-bold text-sm"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1.5 ml-1">Class</label>
                          <select 
                            className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all appearance-none cursor-pointer font-bold text-xs uppercase tracking-widest"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1.5 ml-1">Maker</label>
                          <input 
                            required
                            placeholder="ASUS"
                            className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all font-bold uppercase text-xs"
                            value={formData.brand}
                            onChange={e => setFormData({...formData, brand: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Percent size={12} /> Commercial Params
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1.5 ml-1">MSRP (USD)</label>
                          <input 
                            type="number"
                            required
                            className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all font-bold"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1.5 ml-1">Stock</label>
                          <input 
                            type="number"
                            required
                            className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all font-bold"
                            value={formData.stock}
                            onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-3 ml-1">Status Badge</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: '', label: 'Standard', icon: Tag },
                            { id: 'sale', label: 'Sale', icon: Percent },
                            { id: 'hot', label: 'Hot', icon: Flame },
                            { id: 'featured', label: 'Featured', icon: TrendingUp }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setFormData({...formData, badge: item.id})}
                              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[8px] font-black uppercase transition-all ${
                                formData.badge === item.id 
                                  ? 'bg-[var(--primary)] border-[var(--primary)] text-white dark:text-black shadow-lg shadow-[var(--primary)]/20' 
                                  : 'bg-[var(--input)] border-(--card-border) text-[var(--foreground-muted)] hover:border-[var(--primary)]/50'
                              }`}
                            >
                              <item.icon size={12} />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.badge === 'sale' && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                          <label className="block text-[8px] font-black text-red-500 uppercase tracking-widest mb-1.5 ml-1">Promo Value (USD)</label>
                          <input 
                            type="number"
                            required
                            className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-red-500 focus:border-red-500 outline-none transition-all font-black"
                            value={formData.salePrice}
                            onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                          />
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column: Content & Media */}
                <div className="lg:col-span-7 space-y-8">
                  <section>
                    <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <ImageIcon size={12} /> Visual Assets
                    </h3>
                    <div className="bg-[var(--input)]/30 border border-(--card-border) p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">
                          Neural Gallery ({formData.images.length}/{maxImages})
                        </span>
                        <button 
                          type="button" 
                          disabled={isUploading || formData.images.length >= maxImages}
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[8px] font-black bg-[var(--primary)] text-white dark:text-black px-3 py-1.5 rounded-lg hover:opacity-90 transition-all uppercase disabled:opacity-30"
                        >
                          {isUploading ? 'Uploading...' : 'Add Image'}
                        </button>
                      </div>
                      
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {formData.images.map((url: string, index: number) => (
                          <div key={index} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-(--card-border) group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-[var(--primary)] text-white dark:text-black text-[6px] font-black px-1 rounded shadow-sm z-10 uppercase">
                                MAIN
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1">
                              {index !== 0 && (
                                <button type="button" onClick={() => setMainImage(index)} className="text-[6px] font-black text-white hover:text-[var(--primary)] uppercase">Select Main</button>
                              )}
                              <button type="button" onClick={() => triggerDeleteConfirm(index)} className="text-[6px] font-black text-red-500 uppercase">Delete</button>
                            </div>
                          </div>
                        ))}
                        {formData.images.length === 0 && !isUploading && (
                          <div className="w-full py-8 text-center text-[8px] font-black text-[var(--foreground-muted)] uppercase opacity-30 italic">
                            No Visual Assets Defined
                          </div>
                        )}
                        {isUploading && (
                          <div className="w-24 h-24 bg-[var(--input)] rounded-xl flex items-center justify-center border border-dashed border-[var(--primary)]/30 animate-pulse">
                            <Loader2 className="animate-spin text-[var(--primary)]" size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                        <Tag size={12} /> Marketing
                      </h3>
                      <textarea 
                        placeholder="Neural marketing description..."
                        className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all h-24 resize-none placeholder:text-[var(--foreground-muted)]/50 text-xs font-medium"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                      <textarea 
                        required
                        placeholder="Technical brief specs..."
                        className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all h-24 resize-none placeholder:text-[var(--foreground-muted)]/50 text-xs font-medium"
                        value={formData.specs}
                        onChange={e => setFormData({...formData, specs: e.target.value})}
                      />
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                          <Plus size={12} /> Parameters
                        </h3>
                        <button type="button" onClick={addSpec} className="text-[7px] font-black bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded-md border border-[var(--primary)]/20 uppercase">Add</button>
                      </div>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {formData.fullSpecs.map((spec: any, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input 
                              placeholder="Label"
                              className="w-1/2 bg-[var(--input)] border border-(--card-border) rounded-lg px-2 py-1.5 text-[var(--foreground)] focus:border-[var(--primary)] outline-none text-[10px] font-bold"
                              value={spec.label}
                              onChange={e => updateSpec(index, 'label', e.target.value)}
                            />
                            <input 
                              placeholder="Value"
                              className="w-1/2 bg-[var(--input)] border border-(--card-border) rounded-lg px-2 py-1.5 text-[var(--foreground)] focus:border-[var(--primary)] outline-none text-[10px] font-bold"
                              value={spec.value}
                              onChange={e => updateSpec(index, 'value', e.target.value)}
                            />
                            <button type="button" onClick={() => removeSpec(index)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                              <Trash size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-(--card-border) bg-[var(--input)]/30 flex gap-4 shrink-0">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[var(--input)] text-[var(--foreground-muted)] font-black uppercase text-[10px] tracking-widest hover:bg-[var(--card-border)] transition-all border border-(--card-border)"
              >
                Abort
              </button>
              <button 
                type="submit"
                disabled={loading || isUploading}
                className="flex-1 bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-3 rounded-xl transition-all disabled:opacity-50 shadow-xl shadow-[var(--primary)]/20 uppercase text-[10px] tracking-[0.2em]"
              >
                {loading ? 'Processing...' : product ? 'Overwrite Local Cache' : 'Initialize System Injection'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        multiple 
        accept="image/*" 
        className="hidden" 
      />

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null })}
        onConfirm={handleRemoveImage}
        title="Wipe Visual Cache?"
        message="Are you sure you want to permanently delete this neural asset?"
        itemPreview={deleteModal.index !== null ? formData.images[deleteModal.index] : undefined}
      />
    </>
  );
}
