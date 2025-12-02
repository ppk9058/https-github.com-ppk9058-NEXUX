
import React from 'react';

export const SkeletonTile: React.FC = () => {
  return (
    <div className="h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
      </div>
      
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-16"></div>
      </div>
    </div>
  );
};
