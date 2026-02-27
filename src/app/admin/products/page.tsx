'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, Package, Image as ImageIcon, Trash, Upload, Loader2, Star, Check, Database, Tag, Flame, TrendingUp, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

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
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter">Products Catalog<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--muted)] mt-1 font-medium">Manage, update, and soft-delete products</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[var(--primary)] hover:opacity-90 text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20 text-xs uppercase tracking-widest"
        >
          <Plus size={18} /> Add Product
        </button>
      </header>

      <div className="flex gap-4 items-center bg-[var(--card)] border border-(--card-border) p-4 rounded-2xl shadow-sm">
        <Search className="text-[var(--muted)]" size={20} />
        <input 
          type="text" 
          placeholder="Filter by name or brand..."
          className="bg-transparent border-none outline-none text-[var(--foreground)] w-full text-sm font-medium placeholder:text-[var(--muted)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[var(--card)] border border-(--card-border) rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-(--card-border) bg-[var(--input)]/50">
                <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Product Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] text-center">Inventory</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Price</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-[var(--muted)] animate-pulse font-black uppercase text-xs">Loading Products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-[var(--muted)] italic font-medium">No results matched your search query.</td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-[var(--input)]/30 transition-colors group">
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
                      <span className="font-black text-[var(--foreground)] text-sm tracking-tight group-hover:text-[var(--primary)] transition-colors">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">{p.category}</span>
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
                      <span className={`text-sm font-black ${p.badge === 'sale' && p.salePrice ? 'text-xs text-[var(--muted)] line-through' : 'text-[var(--primary)]'}`}>
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
                        className="p-2.5 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="p-2.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
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
        <div className="bg-[var(--card)] border border-(--card-border) w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-(--card-border) shrink-0 bg-[var(--input)]/30">
            <h2 className="text-xl font-black text-[var(--foreground)] flex items-center gap-2 uppercase tracking-tighter">
              <Package className="text-[var(--primary)]" size={24} />
              {product ? 'Update Product' : 'New Product'}
            </h2>
            <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-2">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-full">
                <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Product Name</label>
                <input 
                  required
                  placeholder="e.g. RTX 5090 Ti Founders Edition"
                  className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl px-5 py-4 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all placeholder:text-[var(--muted)]/50 font-bold"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Unit Class</label>
                <div className="relative">
                  <select 
                    className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl px-5 py-4 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all appearance-none cursor-pointer font-bold"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="GPU">GPU / Graphics</option>
                    <option value="CPU">CPU / Logic</option>
                    <option value="RAM">RAM / Memory</option>
                    <option value="SSD">SSD / Storage</option>
                    <option value="PSU">PSU / Power</option>
                    <option value="Case">Case / Chassis</option>
                    <option value="Cooler">Cooler / Thermal</option>
                    <option value="Monitor">Display / Unit</option>
                    <option value="Motherboard">Base / PCB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Manufacturer</label>
                <input 
                  required
                  placeholder="e.g. ASUS, NVIDIA"
                  className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl px-5 py-4 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all placeholder:text-[var(--muted)]/50 font-bold"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Status ID</label>
                <div className="grid grid-cols-2 gap-3">
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
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${
                        formData.badge === item.id 
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white dark:text-black shadow-lg shadow-[var(--primary)]/20' 
                          : 'bg-[var(--input)] border-(--card-border) text-[var(--muted)] hover:border-slate-400'
                      }`}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Stock Units</label>
                <div className="relative">
                  <Database className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                  <input 
                    type="number"
                    min="0"
                    required
                    className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl pl-14 pr-5 py-4 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all font-bold"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className={formData.badge === 'sale' ? 'col-span-1' : 'col-span-full'}>
                <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Base Value (USD)</label>
                <input 
                  type="number"
                  required
                  className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl px-5 py-4 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all font-bold"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>

              {formData.badge === 'sale' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">Discounted Value</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-red-500/5 border border-red-500/20 rounded-2xl px-5 py-4 text-red-500 focus:border-red-500 outline-none transition-all font-black"
                    value={formData.salePrice}
                    onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
                  Interface Assets <span className="text-[var(--primary)] font-black">({formData.images.length}/{maxImages})</span>
                </label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  disabled={isUploading || formData.images.length >= maxImages}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-[9px] font-black bg-[var(--input)] text-[var(--primary)] px-4 py-2.5 rounded-xl border border-(--card-border) hover:border-[var(--primary)] transition-all uppercase disabled:opacity-30"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                  {isUploading ? 'Compiling...' : 'Upload Visuals'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 bg-[var(--input)]/50 p-5 rounded-3xl border border-(--card-border) min-h-[140px]">
                {formData.images.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-(--card-border) group ring-1 ring-black/5 shadow-sm">
                    <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-[var(--primary)] text-white dark:text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg z-10 uppercase tracking-tighter">
                        PRIMARY
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-2">
                      {index !== 0 && (
                        <button 
                          type="button"
                          onClick={() => setMainImage(index)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 bg-[var(--primary)] text-white dark:text-black rounded-lg text-[8px] font-black hover:opacity-90 transition-colors uppercase"
                        >
                          <Star size={10} fill="currentColor" /> Set Main
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => triggerDeleteConfirm(index)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-500 text-white rounded-lg text-[8px] font-black hover:bg-red-600 transition-colors uppercase"
                      >
                        <Trash size={10} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {formData.images.length === 0 && !isUploading && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-[var(--muted)] italic text-[9px] gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--input)] flex items-center justify-center border border-(--card-border)">
                      <ImageIcon size={24} className="opacity-20" />
                    </div>
                    INITIALIZE VISUAL INTERFACE
                  </div>
                )}
                {isUploading && (
                  <div className="aspect-square bg-[var(--input)] rounded-2xl flex items-center justify-center border border-[var(--primary)]/30 border-dashed animate-pulse">
                    <Loader2 className="animate-spin text-[var(--primary)]" size={24} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Product Description (Marketing Hype)</label>
              <textarea 
                placeholder="Write a compelling description... (Leave empty for auto-generated hype)"
                className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl px-5 py-4 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all h-32 resize-none placeholder:text-[var(--muted)]/50 text-sm font-medium leading-relaxed"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Product Specifications (Brief)</label>
              <textarea 
                required
                placeholder="List technical data points for the card..."
                className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl px-5 py-4 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all h-24 resize-none placeholder:text-[var(--muted)]/50 text-sm font-medium leading-relaxed"
                value={formData.specs}
                onChange={e => setFormData({...formData, specs: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Detailed Key-Value Specs</label>
                <button 
                  type="button"
                  onClick={addSpec}
                  className="text-[9px] font-black bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-2 rounded-xl border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-all uppercase flex items-center gap-2"
                >
                  <Plus size={14} /> Add Parameter
                </button>
              </div>

              <div className="space-y-3">
                {formData.fullSpecs.map((spec: any, index: number) => (
                  <div key={index} className="flex gap-3 items-center group animate-in slide-in-from-left-2 duration-200">
                    <input 
                      placeholder="Label (e.g. RGB)"
                      className="flex-1 bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all text-xs font-bold"
                      value={spec.label}
                      onChange={e => updateSpec(index, 'label', e.target.value)}
                    />
                    <div className="flex-1 flex gap-2">
                      <input 
                        placeholder="Value (e.g. Yes)"
                        className="flex-1 bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all text-xs font-bold"
                        value={spec.value}
                        onChange={e => updateSpec(index, 'value', e.target.value)}
                      />
                      <div className="flex gap-1">
                        <button 
                          type="button"
                          onClick={() => updateSpec(index, 'value', 'true')}
                          className={`w-10 rounded-xl border flex items-center justify-center transition-all ${spec.value === 'true' ? 'bg-green-500 border-green-500 text-white' : 'bg-[var(--input)] border-(--card-border) text-[var(--muted)] hover:border-green-500/50'}`}
                          title="Set as Boolean TRUE"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => updateSpec(index, 'value', 'false')}
                          className={`w-10 rounded-xl border flex items-center justify-center transition-all ${spec.value === 'false' ? 'bg-red-500 border-red-500 text-white' : 'bg-[var(--input)] border-(--card-border) text-[var(--muted)] hover:border-red-500/50'}`}
                          title="Set as Boolean FALSE"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeSpec(index)}
                      className="p-3 text-[var(--muted)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {formData.fullSpecs.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-(--card-border) rounded-3xl text-[9px] font-black text-[var(--muted)] uppercase tracking-widest opacity-30">
                    NO TECHNICAL PARAMETERS DEFINED
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-(--card-border)">
              <button 
                type="button"
                onClick={onClose}
                className="px-8 py-4 rounded-2xl bg-[var(--input)] text-[var(--muted)] font-black uppercase text-[10px] tracking-widest hover:bg-[var(--card-border)] transition-all border border-(--card-border)"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || isUploading}
                className="flex-1 bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black py-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-[var(--primary)]/20 uppercase text-[10px] tracking-[0.2em]"
              >
                {loading ? 'Transmitting...' : product ? 'Overwrite Local Cache' : 'Execute System Creation'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null })}
        onConfirm={handleRemoveImage}
        title="Wipe Visual Cache?"
        message="Are you sure you want to permanently delete this neural asset from the unit gallery?"
        itemPreview={deleteModal.index !== null ? formData.images[deleteModal.index] : undefined}
      />
    </>
  );
}
