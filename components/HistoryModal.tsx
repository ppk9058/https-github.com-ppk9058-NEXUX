
import React from 'react';
import { X, History as HistoryIcon, User, Bot, ArrowRight } from 'lucide-react';
import { StatusHistoryEntry } from '../types';
import { STATUS_LABELS } from '../constants';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: StatusHistoryEntry[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-slate-500" />
            Status History
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No history available for this item.</div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((entry) => (
                <li key={entry.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {entry.actor.toLowerCase().includes('agent') || entry.actor.toLowerCase().includes('system') ? (
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{entry.actor}</span>
                        <span className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-medium mt-1">
                        <span className="text-slate-500 dark:text-slate-500">{STATUS_LABELS[entry.previousStatus]}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="text-slate-900 dark:text-white">{STATUS_LABELS[entry.newStatus]}</span>
                      </div>

                      {entry.reason && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800 italic">
                          "{entry.reason}"
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
