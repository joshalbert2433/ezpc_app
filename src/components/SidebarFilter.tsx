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
    { id: 'sale', label: 'On Sale' },
    { id: 'featured', label: 'Featured' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'hot', label: 'Trending' }
  ];

  return (
    <aside className="w-64 flex-shrink-0 space-y-6">
      <div className="bg-[var(--card)] border border-(--card-border) rounded-2xl p-6 sticky top-28 shadow-sm dark:shadow-none">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-6 flex items-center gap-2">
          <Filter className="w-3 h-3" /> Filter System
        </h3>

        <div className="space-y-8">
          {/* Sort By */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-3 block">Display Order</label>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] w-3 h-3 pointer-events-none" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)] appearance-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Quick Filters / Badges */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-3 block">Special Status</label>
            <div className="grid grid-cols-1 gap-2">
              {badges.map(badge => (
                <button
                  key={badge.id}
                  onClick={() => toggleBadge(badge.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                    selectedBadges.includes(badge.id)
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white dark:text-black'
                      : 'bg-[var(--input)] border-(--card-border) text-[var(--muted)] hover:border-slate-400'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border ${selectedBadges.includes(badge.id) ? 'bg-white border-white dark:bg-black dark:border-black' : 'border-(--card-border)'}`} />
                  {badge.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-3 block">Category</label>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <div className={`w-4 h-4 border rounded-lg flex items-center justify-center transition-all ${selectedCategories.includes(cat) ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-(--card-border) bg-[var(--input)] group-hover:border-slate-400'}`}>
                    {selectedCategories.includes(cat) && <CheckCircle2 className="w-3 h-3 text-white dark:text-black" />}
                  </div>
                  <span className={`text-[11px] uppercase tracking-wide transition-colors ${selectedCategories.includes(cat) ? 'text-[var(--foreground)] font-black' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-3 block">Price Range (USD)</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="space-y-1">
                <span className="text-[8px] font-black text-[var(--muted)] uppercase ml-1">Min</span>
                <input 
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-3 py-2 text-[11px] font-black focus:outline-none focus:border-[var(--primary)]"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black text-[var(--muted)] uppercase ml-1">Max</span>
                <input 
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value) || 0))}
                  className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-3 py-2 text-[11px] font-black focus:outline-none focus:border-[var(--primary)]"
                  placeholder="5000"
                />
              </div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5000" 
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--input)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]" 
            />
            <div className="flex justify-between text-[9px] text-[var(--muted)] mt-2 font-black uppercase tracking-tighter">
              <span>$0</span>
              <span>$5000+</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-3 block">Manufacturer</label>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <div className={`w-4 h-4 border rounded-lg flex items-center justify-center transition-all ${selectedBrands.includes(brand) ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-(--card-border) bg-[var(--input)] group-hover:border-slate-400'}`}>
                    {selectedBrands.includes(brand) && <CheckCircle2 className="w-3 h-3 text-white dark:text-black" />}
                  </div>
                  <span className={`text-[11px] uppercase tracking-wide transition-colors ${selectedBrands.includes(brand) ? 'text-[var(--foreground)] font-black' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'}`}>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
