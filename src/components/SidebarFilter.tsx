// src/components/SidebarFilters.tsx
import { Filter, CheckCircle2, ArrowUpDown } from 'lucide-react';
import React from 'react';

interface SidebarFiltersProps {
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  minPrice: number;
  setMinPrice: (val: number) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  selectedBadges: string[];
  toggleBadge: (badge: string) => void;
}

const SidebarFilter: React.FC<SidebarFiltersProps> = ({ 
  selectedBrands, 
  toggleBrand, 
  selectedCategories,
  toggleCategory,
  minPrice,
  setMinPrice,
  maxPrice, 
  setMaxPrice,
  sortBy,
  setSortBy,
  selectedBadges,
  toggleBadge
}) => {
  const brands = ['ASUS', 'MSI', 'Gigabyte', 'AMD', 'Intel', 'Samsung', 'Corsair', 'NZXT', 'Lian Li', 'G.Skill'];
  const categories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'PSU', 'Case', 'Cooler', 'Monitor'];
  const badges = [
    { id: 'sale', label: 'Sale' },
    { id: 'featured', label: 'Featured' },
    { id: 'new', label: 'New' },
    { id: 'hot', label: 'Hot' }
  ];

  return (
    <aside className="w-52 flex-shrink-0 space-y-4">
      <div className="bg-[var(--card)] border border-(--card-border) rounded-xl p-4 sticky top-28 shadow-sm dark:shadow-none">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-4 flex items-center gap-2">
          <Filter className="w-2.5 h-2.5" /> Filter System
        </h3>

        <div className="space-y-5">
          {/* Sort By */}
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 block">Sort</label>
            <div className="relative">
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] w-2.5 h-2.5 pointer-events-none" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[var(--input)] border border-(--card-border) rounded-lg pl-7 pr-2 py-1.5 text-[10px] font-bold focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)] appearance-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low</option>
                <option value="high">Price: High</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Quick Filters / Badges */}
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 block">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {badges.map(badge => (
                <button
                  key={badge.id}
                  onClick={() => toggleBadge(badge.id)}
                  className={`px-2 py-1 rounded-lg border text-[8px] font-black uppercase transition-all ${
                    selectedBadges.includes(badge.id)
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white dark:text-black'
                      : 'bg-[var(--input)] border-(--card-border) text-[var(--muted)] hover:border-slate-400'
                  }`}
                >
                  {badge.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 block">Category</label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <div className={`w-3 h-3 border rounded-md flex items-center justify-center transition-all ${selectedCategories.includes(cat) ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-(--card-border) bg-[var(--input)] group-hover:border-slate-400'}`}>
                    {selectedCategories.includes(cat) && <CheckCircle2 className="w-2.5 h-2.5 text-white dark:text-black" />}
                  </div>
                  <span className={`text-[9px] uppercase tracking-wide transition-colors ${selectedCategories.includes(cat) ? 'text-[var(--foreground)] font-black' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 block">Range (USD)</label>
            <div className="grid grid-cols-2 gap-1.5 mb-2.5">
              <input 
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[var(--input)] border border-(--card-border) rounded-lg px-2 py-1 text-[9px] font-black focus:outline-none focus:border-[var(--primary)]"
                placeholder="Min"
              />
              <input 
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value) || 0))}
                className="w-full bg-[var(--input)] border border-(--card-border) rounded-lg px-2 py-1 text-[9px] font-black focus:outline-none focus:border-[var(--primary)]"
                placeholder="Max"
              />
            </div>
            <input 
              type="range" 
              min="0" 
              max="5000" 
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--input)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]" 
            />
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 block">Brand</label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <div className={`w-3 h-3 border rounded-md flex items-center justify-center transition-all ${selectedBrands.includes(brand) ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-(--card-border) bg-[var(--input)] group-hover:border-slate-400'}`}>
                    {selectedBrands.includes(brand) && <CheckCircle2 className="w-2.5 h-2.5 text-white dark:text-black" />}
                  </div>
                  <span className={`text-[9px] uppercase tracking-wide transition-colors ${selectedBrands.includes(brand) ? 'text-[var(--foreground)] font-black' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'}`}>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--card-border);
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
};

export default SidebarFilter;
