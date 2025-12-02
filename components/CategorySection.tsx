
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { Category } from '../types';

interface CategorySectionProps {
  category: Category;
  count: number;
  children: React.ReactNode;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ category, count, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group py-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
              {category.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-full">
                {count} Checks
            </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};
