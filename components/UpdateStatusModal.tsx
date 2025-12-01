import React, { useState } from 'react';
import { X, Save, TriangleAlert, FileCode, GitPullRequest, Terminal, Server, Image, Box, MessageSquare } from 'lucide-react';
import { ProjectStatus, StatusEnum, Subcategory, EvidenceType } from '../types';
import { STATUS_LABELS } from '../constants';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: Subcategory | null;
  currentStatus: ProjectStatus | null;
  onUpdate: (subcategoryId: string, newStatus: StatusEnum, reason: string, evidenceUrl?: string, evidenceType?: EvidenceType) => void;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ 
  isOpen, onClose, subcategory, currentStatus, onUpdate 
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusEnum>(currentStatus?.status || StatusEnum.NOT_STARTED);
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('pr');

  // Reset state when modal opens with new data
  React.useEffect(() => {
    if (isOpen && currentStatus) {
        setSelectedStatus(currentStatus.status);
        setReason('');
        setEvidenceUrl('');
        setEvidenceType('pr');
    }
  }, [isOpen, currentStatus]);

  if (!isOpen || !subcategory) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(subcategory.id, selectedStatus, reason, evidenceUrl, evidenceType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Update Status</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Subcategory</label>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-800 text-sm font-medium">
              {subcategory.title}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">New Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATUS_LABELS) as StatusEnum[]).map((statusKey) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setSelectedStatus(statusKey)}
                  className={`px-3 py-2 text-xs rounded-lg border font-medium transition-all text-center ${
                    selectedStatus === statusKey
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {STATUS_LABELS[statusKey]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Reason for Update</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-shadow"
              placeholder="e.g. Verified manually in staging environment..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Evidence</label>
             <div className="flex gap-2">
                <div className="w-1/3">
                    <select 
                        value={evidenceType}
                        onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                    >
                        <option value="pr">PR</option>
                        <option value="pipeline">Pipeline</option>
                        <option value="file">File</option>
                        <option value="screenshot">Screenshot</option>
                        <option value="console_log">Log</option>
                        <option value="artifact">Artifact</option>
                        <option value="ai_chat">AI Chat</option>
                    </select>
                </div>
                <div className="flex-1">
                    <input
                      type="text"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="URL or Description"
                    />
                </div>
             </div>
          </div>

          {currentStatus?.lastUpdatedBy === 'system_agent' && (
             <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-xs">
                <TriangleAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Overriding a system-reported status will create a conflict record in the audit logs.</p>
             </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};