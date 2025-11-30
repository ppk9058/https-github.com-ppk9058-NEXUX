import React from 'react';
import { X, FileCode, GitPullRequest, Terminal, ExternalLink } from 'lucide-react';
import { Evidence } from '../types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: Evidence[];
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ isOpen, onClose, evidence }) => {
  if (!isOpen) return null;

  const getIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'pr': return <GitPullRequest className="w-4 h-4 text-purple-600" />;
      case 'console_log': return <Terminal className="w-4 h-4 text-slate-600" />;
      case 'file': return <FileCode className="w-4 h-4 text-blue-600" />;
      default: return <ExternalLink className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Attached Evidence</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-0">
          {evidence.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No evidence attached.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {evidence.map((item) => (
                <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-full">
                        {getIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500 capitalize">{item.type} • {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button onClick={onClose} className="text-sm text-slate-600 hover:text-slate-900 font-medium">Close</button>
        </div>
      </div>
    </div>
  );
};
