'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, Package, Image as ImageIcon, Trash, Upload, Loader2, Star, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
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
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Brand</th>
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
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform overflow-hidden">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} />
                        )}
                      </div>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{p.category}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{p.brand}</td>
                  <td className="px-6 py-4 text-cyan-400 font-black">${p.price.toLocaleString()}</td>
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
  
  // State for image deletion confirmation
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, index: number | null}>({
    isOpen: false,
    index: null
  });
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'GPU',
    brand: product?.brand || '',
    price: product?.price || 0,
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
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      setFormData({ ...formData, images: newImageUrls });
      toast.success('Images uploaded and optimized');
    } catch (err) {
      toast.error('Upload error occurred');
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
        toast.error('Failed to save product');
      }
    } catch (err) {
      toast.error('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <h2 className="text-xl font-black text-white">
              {product ? 'Edit Component' : 'Add New Component'}
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Component Name</label>
                <input 
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Category</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="GPU">GPU</option>
                  <option value="CPU">CPU</option>
                  <option value="RAM">RAM</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Motherboard">Motherboard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Price (USD)</label>
                <input 
                  type="number"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Brand</label>
              <input 
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors"
                value={formData.brand}
                onChange={e => setFormData({...formData, brand: e.target.value})}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                  Media Gallery <span className="text-slate-600 font-bold">({formData.images.length}/{maxImages})</span>
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
                  className="flex items-center gap-2 text-[10px] font-black bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all uppercase disabled:opacity-30"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
                  {isUploading ? 'Optimizing...' : 'Upload Images'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[100px]">
                {formData.images.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 group">
                    <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    
                    {index === 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-cyan-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg z-10 uppercase tracking-tighter">
                        Main
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      {index !== 0 && (
                        <button 
                          type="button"
                          onClick={() => setMainImage(index)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500 text-black rounded text-[9px] font-black hover:bg-cyan-400 transition-colors shadow-lg uppercase"
                        >
                          <Star size={10} fill="currentColor" /> Main
                        </button>
                      )}
                      {index === 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 text-cyan-400 rounded text-[9px] font-black border border-cyan-500/30 uppercase backdrop-blur-sm">
                          <Check size={10} /> Active
                        </div>
                      )}
                      <button 
                        type="button" 
                        onClick={() => triggerDeleteConfirm(index)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-red-500 text-white rounded text-[9px] font-black hover:bg-red-400 transition-colors shadow-lg uppercase"
                      >
                        <Trash size={10} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {formData.images.length === 0 && !isUploading && (
                  <div className="col-span-full flex flex-col items-center justify-center py-6 text-slate-600 italic text-xs gap-2">
                    <ImageIcon size={24} className="opacity-20" />
                    No visual assets uploaded
                  </div>
                )}
                {isUploading && (
                  <div className="aspect-square bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 border-dashed animate-pulse">
                    <Loader2 className="animate-spin text-cyan-500" size={20} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Specs Summary</label>
              <textarea 
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors h-24 resize-none"
                value={formData.specs}
                onChange={e => setFormData({...formData, specs: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading || isUploading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl mt-4 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(34,211,238,0.2)] shrink-0 active:scale-[0.98]"
            >
              {loading ? 'Transmitting Data...' : product ? 'Update System Component' : 'Finalize Component Creation'}
            </button>
          </form>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null })}
        onConfirm={handleRemoveImage}
        title="Remove Image?"
        message="This will permanently disconnect this visual asset from the component gallery."
        itemPreview={deleteModal.index !== null ? formData.images[deleteModal.index] : undefined}
      />
    </>
  );
}
