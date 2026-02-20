// src/components/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mt-12 flex justify-center items-center gap-2">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50">
        <ChevronLeft className="w-5 h-5" />
      </button>
      {pages.map(page => (
        <button 
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg border transition-colors ${page === currentPage ? 'bg-cyan-500 border-cyan-500 text-black font-bold' : 'border-slate-800 hover:border-slate-600 text-slate-400'}`}
        >
          {page}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
