// src/components/SidebarFilters.tsx
import { Filter, CheckCircle2 } from 'lucide-react';
import React from 'react';

interface SidebarFiltersProps {
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
}

const SidebarFilter: React.FC<SidebarFiltersProps> = ({ 
  selectedBrands, 
  toggleBrand, 
  selectedCategories,
  toggleCategory,
  maxPrice, 
  setMaxPrice 
}) => {
  const brands = ['ASUS', 'MSI', 'Gigabyte', 'AMD', 'Intel', 'Samsung', 'Corsair', 'NZXT', 'Lian Li', 'G.Skill'];
  const categories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'PSU', 'Case', 'Cooler', 'Monitor'];

  return (
    <aside className="w-64 flex-shrink-0 space-y-6">
      <div className="bg-[var(--card)] border border-(--card-border) rounded-xl p-5 sticky top-28 shadow-sm dark:shadow-none">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-4 flex items-center gap-2">
          <Filter className="w-3 h-3" /> Filters
        </h3>

        <div className="space-y-8">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-semibold mb-3 block text-[var(--foreground)]">Category</label>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${selectedCategories.includes(cat) ? 'bg-cyan-500 border-cyan-500' : 'border-(--card-border) bg-[var(--input)] group-hover:border-slate-400'}`}>
                    {selectedCategories.includes(cat) && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </div>
                  <span className={`text-sm transition-colors ${selectedCategories.includes(cat) ? 'text-[var(--foreground)] font-medium' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-sm font-semibold mb-3 block text-[var(--foreground)]">Brand</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${selectedBrands.includes(brand) ? 'bg-cyan-500 border-cyan-500' : 'border-(--card-border) bg-[var(--input)] group-hover:border-slate-400'}`}>
                    {selectedBrands.includes(brand) && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </div>
                  <span className={`text-sm transition-colors ${selectedBrands.includes(brand) ? 'text-[var(--foreground)] font-medium' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="text-sm font-semibold mb-3 block text-[var(--foreground)]">Max Price: <span className="text-cyan-500">${maxPrice.toLocaleString()}</span></label>
            <input 
              type="range" 
              min="100" 
              max="5000" 
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--input)] rounded-lg appearance-none cursor-pointer accent-cyan-500" 
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase">
              <span>$100</span>
              <span>$5000+</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarFilter;
