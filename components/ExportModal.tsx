
import React, { useState } from 'react';
import { X, FileJson, FileSpreadsheet, Download } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'json' | 'csv') => void;
  projectName: string;
  stageName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, projectName, stageName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white">Export Audit Report</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Generate a compliance report for <strong className="text-slate-900 dark:text-white">{projectName}</strong> in the <strong className="uppercase">{stageName}</strong> environment.
            </p>

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => onExport('json')}
                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                    <FileJson className="w-8 h-8 text-slate-400 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">JSON</span>
                </button>

                <button 
                    onClick={() => onExport('csv')}
                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                >
                    <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 dark:text-slate-500 dark:group-hover:text-emerald-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">CSV</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
