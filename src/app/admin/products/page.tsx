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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Products Catalog<span className="text-cyan-400">_</span></h1>
          <p className="text-slate-400 mt-1">Manage, update, and soft-delete system components</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
        >
          <Plus size={20} /> Add Component
        </button>
      </header>

      <div className="flex gap-4 items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <Search className="text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Filter by name or brand..."
          className="bg-transparent border-none outline-none text-white w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">Stock</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 animate-pulse">Loading components...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">No components found matching your search.</td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform overflow-hidden relative border border-slate-700">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} />
                        )}
                        {p.badge && (
                          <div className={`absolute top-0 left-0 text-[6px] font-black px-1 rounded-br uppercase ${
                            p.badge === 'sale' ? 'bg-red-500 text-white' : 
                            p.badge === 'hot' ? 'bg-orange-500 text-white' : 
                            'bg-cyan-500 text-black'
                          }`}>
                            {p.badge}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{p.category}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                      p.stock <= 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                      p.stock < 5 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                      'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                      {p.stock <= 0 ? 'Out of Stock' : `${p.stock} Units`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`${p.badge === 'sale' && p.salePrice ? 'text-xs text-slate-500 line-through' : 'text-cyan-400 font-black'}`}>
                        ${p.price.toLocaleString()}
                      </span>
                      {p.badge === 'sale' && p.salePrice && (
                        <span className="text-red-400 font-black text-sm">
                          ${p.salePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(p)}
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
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
    images: Array.isArray(product?.images) ? [...product.images] : [],
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
        images: Array.isArray(product.images) ? [...product.images] : [],
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
      toast.success('Images optimized and ready');
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
      toast.success('Image removed');
    }
  };

  const setMainImage = (index: number) => {
    const newImages = [...formData.images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setFormData({ ...formData, images: newImages });
    toast.success('Main image updated');
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
        toast.success(product ? 'Product updated' : 'Product created');
        onSuccess();
      } else {
        toast.error('Save failed');
      }
    } catch (err) {
      toast.error('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Package className="text-cyan-400" size={24} />
              {product ? 'Modify Component' : 'New System Component'}
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Component Designation</label>
                <input 
                  required
                  placeholder="e.g. RTX 5090 Ti Founders Edition"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Hardware Category</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="GPU">GPU / Graphics Card</option>
                  <option value="CPU">CPU / Processor</option>
                  <option value="RAM">RAM / Memory</option>
                  <option value="SSD">Storage / SSD</option>
                  <option value="PSU">Power Supply</option>
                  <option value="Monitor">Monitor / Display</option>
                  <option value="Motherboard">Motherboard</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Manufacturer / Brand</label>
                <input 
                  required
                  placeholder="e.g. ASUS, NVIDIA, AMD"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Status Badge</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '', label: 'None', icon: Tag },
                    { id: 'sale', label: 'Sale', icon: Percent },
                    { id: 'hot', label: 'Hot', icon: Flame },
                    { id: 'featured', label: 'Featured', icon: TrendingUp }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({...formData, badge: item.id})}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-black uppercase transition-all ${
                        formData.badge === item.id 
                          ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Stock Inventory</label>
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="number"
                    min="0"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className={formData.badge === 'sale' ? 'col-span-1' : 'col-span-full'}>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Base Price (USD)</label>
                <input 
                  type="number"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>

              {formData.badge === 'sale' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Discounted Sale Price</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 focus:border-red-500 outline-none transition-all"
                    value={formData.salePrice}
                    onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Visual Interface Gallery <span className="text-slate-600 font-bold">({formData.images.length}/{maxImages})</span>
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
                  className="flex items-center gap-2 text-[10px] font-black bg-slate-800 text-cyan-400 px-4 py-2 rounded-xl border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700 transition-all uppercase disabled:opacity-30"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                  {isUploading ? 'Compiling Visuals...' : 'Add Neural Assets'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[120px]">
                {formData.images.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 group ring-1 ring-white/5">
                    <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-cyan-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg z-10 uppercase tracking-tighter">
                        PRIMARY
                      </div>
                    )}

                    <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-2">
                      {index !== 0 && (
                        <button 
                          type="button"
                          onClick={() => setMainImage(index)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-cyan-500 text-black rounded-lg text-[8px] font-black hover:bg-cyan-400 transition-colors uppercase"
                        >
                          <Star size={10} fill="currentColor" /> Set Main
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => triggerDeleteConfirm(index)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-red-500/20 text-red-500 rounded-lg text-[8px] font-black hover:bg-red-500 hover:text-white border border-red-500/30 transition-colors uppercase"
                      >
                        <Trash size={10} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {formData.images.length === 0 && !isUploading && (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-slate-700 italic text-[10px] gap-3">
                    <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center">
                      <ImageIcon size={20} className="opacity-20" />
                    </div>
                    NO VISUAL DATA INITIALIZED
                  </div>
                )}
                {isUploading && (
                  <div className="aspect-square bg-slate-900 rounded-xl flex items-center justify-center border border-cyan-500/20 border-dashed animate-pulse">
                    <Loader2 className="animate-spin text-cyan-500" size={24} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Technical Specifications Summary</label>
              <textarea 
                required
                placeholder="List key hardware specs..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all h-32 resize-none placeholder:text-slate-600 text-sm leading-relaxed"
                value={formData.specs}
                onChange={e => setFormData({...formData, specs: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-8 py-4 rounded-xl bg-slate-800 text-slate-400 font-black uppercase text-xs hover:bg-slate-700 transition-all"
              >
                Abort
              </button>
              <button 
                type="submit"
                disabled={loading || isUploading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(34,211,238,0.2)] uppercase text-xs tracking-[0.2em]"
              >
                {loading ? 'Transmitting...' : product ? 'Overwrite Data' : 'Execute Creation'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null })}
        onConfirm={handleRemoveImage}
        title="Wipe Visual Data?"
        message="Are you sure you want to permanently delete this neural asset from the component gallery?"
        itemPreview={deleteModal.index !== null ? formData.images[deleteModal.index] : undefined}
      />
    </>
  );
}
