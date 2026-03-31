// src/components/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to show (simple version)
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...');
    }
  }

  // Remove duplicate dots
  const uniquePages = pages.filter((v, i, a) => v !== '...' || a[i - 1] !== '...');

  return (
    <div className="flex justify-center items-center gap-2 py-8">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1} 
        className="p-2 border border-(--card-border) rounded-xl hover:bg-[var(--input)] disabled:opacity-30 transition-all text-[var(--foreground)]"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {uniquePages.map((page, index) => (
        page === '...' ? (
          <span key={`dots-${index}`} className="text-[var(--muted)] px-2">...</span>
        ) : (
          <button 
            key={`page-${page}`}
            onClick={() => onPageChange(Number(page))}
            className={`w-10 h-10 rounded-xl border transition-all text-xs font-black uppercase ${
              page === currentPage 
                ? 'bg-[var(--primary)] border-[var(--primary)] text-white dark:text-black shadow-lg shadow-[var(--primary)]/20' 
                : 'border-(--card-border) hover:border-[var(--primary)] text-[var(--foreground-muted)] hover:text-[var(--primary)]'
            }`}
          >
            {page}
          </button>
        )
      ))}

      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages} 
        className="p-2 border border-(--card-border) rounded-xl hover:bg-[var(--input)] disabled:opacity-30 transition-all text-[var(--foreground)]"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
