'use client';

import React, { useState, useMemo, useEffect } from 'react';
import SidebarFilter from '../components/SidebarFilter';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { useSearch } from '../context/SearchContext';
import type { Product } from '../types/product';

export default function Home() {
  const { searchQuery } = useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
      if (selectedCategories.length > 0) params.append('category', selectedCategories.join(','));
      if (maxPrice < 5000) params.append('maxPrice', maxPrice.toString());
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy !== 'featured') params.append('sort', sortBy);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      
      // Convert MongoDB _id to id if necessary for existing components
      const formattedData = data.map((p: any) => ({
        ...p,
        id: p._id || p.id
      }));
      
      setProducts(formattedData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedBrands, selectedCategories, maxPrice, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    setCurrentPage(1);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
    setCurrentPage(1);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
      <SidebarFilter 
        selectedBrands={selectedBrands} 
        toggleBrand={toggleBrand} 
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        maxPrice={maxPrice} 
        setMaxPrice={setMaxPrice} 
      />

      <section className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">
            {loading ? (
              "Loading products..."
            ) : products.length > 0 ? (
              <>Showing <span className="text-cyan-400">{products.length}</span> products</>
            ) : (
              "No products found"
            )}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-64 animate-pulse" />
             ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl py-20 text-center">
            <p className="text-slate-500">Try adjusting your filters or search query</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={1} onPageChange={setCurrentPage} />
        )}
      </section>
    </main>
  );
}
