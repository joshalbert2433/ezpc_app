'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import SidebarFilter from '../components/SidebarFilter';
import ProductCard from '../components/ProductCard';
import { useSearch } from '../context/SearchContext';
import type { Product } from '../types/product';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { searchQuery } = useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchProducts = async (currentPage: number, isNewSearch: boolean) => {
    if (isNewSearch) setInitialLoading(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
      if (selectedCategories.length > 0) params.append('category', selectedCategories.join(','));
      if (selectedBadges.length > 0) params.append('badges', selectedBadges.join(','));
      if (minPrice > 0) params.append('minPrice', minPrice.toString());
      if (maxPrice < 5000) params.append('maxPrice', maxPrice.toString());
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy !== 'featured') params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '9'); // 3x3 grid

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      
      const formattedProducts = data.products.map((p: any) => ({
        ...p,
        id: p._id || p.id
      }));

      if (isNewSearch) {
        setProducts(formattedProducts);
      } else {
        setProducts(prev => [...prev, ...formattedProducts]);
      }
      
      setHasMore(data.hasMore);
      setTotalProducts(data.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Reset and fetch when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchProducts(1, true);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedBrands, selectedCategories, selectedBadges, minPrice, maxPrice, sortBy]);

  // Fetch more when page changes (infinite scroll)
  useEffect(() => {
    if (page > 1) {
      fetchProducts(page, false);
    }
  }, [page]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const toggleBadge = (badge: string) => {
    setSelectedBadges(prev => prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
      <SidebarFilter 
        selectedBrands={selectedBrands} 
        toggleBrand={toggleBrand} 
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice} 
        setMaxPrice={setMaxPrice}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedBadges={selectedBadges}
        toggleBadge={toggleBadge}
      />

      <section className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">
            {initialLoading ? (
              <span className="flex items-center gap-2">Initializing Neural Catalog <Loader2 size={16} className="animate-spin text-[var(--primary)]" /></span>
            ) : products.length > 0 ? (
              <>Showing <span className="text-[var(--primary)]">{products.length}</span> of <span className="text-[var(--primary)]">{totalProducts}</span> hardware units</>
            ) : (
              "No units detected in this sector"
            )}
          </h2>
        </div>

        {initialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-4 h-80 animate-pulse flex flex-col">
                 <div className="aspect-square bg-[var(--input)] rounded-xl mb-4" />
                 <div className="h-4 bg-[var(--input)] rounded w-3/4 mb-2" />
                 <div className="h-3 bg-[var(--input)] rounded w-1/2" />
               </div>
             ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => {
                if (products.length === index + 1) {
                  return (
                    <div ref={lastProductElementRef} key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  );
                } else {
                  return <ProductCard key={product.id} product={product} />;
                }
              })}
            </div>
            
            {loading && !initialLoading && (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Syncing additional data...</span>
                </div>
              </div>
            )}
            
            {!hasMore && products.length > 0 && (
              <div className="text-center py-16">
                <div className="inline-block px-6 py-2 rounded-full border border-(--card-border) bg-[var(--card)] text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.3em]">
                  — END OF DATABASE REACHED —
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[var(--card)]/30 border border-(--card-border) border-dashed rounded-3xl py-24 text-center">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="w-16 h-16 bg-[var(--input)] rounded-2xl flex items-center justify-center mx-auto opacity-20">
                <Loader2 size={32} />
              </div>
              <p className="text-[var(--muted)] font-bold text-sm tracking-wide">Adjust your synchronization parameters to detect hardware units in this sector.</p>
              <button 
                onClick={() => {
                  setSelectedBrands([]);
                  setSelectedCategories([]);
                  setSelectedBadges([]);
                  setMinPrice(0);
                  setMaxPrice(5000);
                  setSortBy("featured");
                }}
                className="text-[var(--primary)] font-black uppercase text-[10px] tracking-widest hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
