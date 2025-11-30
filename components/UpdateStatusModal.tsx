import React, { useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { ProjectStatus, StatusEnum, Subcategory } from '../types';
import { STATUS_LABELS } from '../constants';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: Subcategory | null;
  currentStatus: ProjectStatus | null;
  onUpdate: (subcategoryId: string, newStatus: StatusEnum, reason: string, evidenceUrl?: string) => void;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ 
  isOpen, onClose, subcategory, currentStatus, onUpdate 
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusEnum>(currentStatus?.status || StatusEnum.NOT_STARTED);
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  // Reset state when modal opens with new data
  React.useEffect(() => {
    if (isOpen && currentStatus) {
        setSelectedStatus(currentStatus.status);
        setReason('');
        setEvidenceUrl('');
    }
  }, [isOpen, currentStatus]);

  if (!isOpen || !subcategory) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(subcategory.id, selectedStatus, reason, evidenceUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Update Status</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
            <div className="p-2 bg-slate-100 rounded text-slate-600 text-sm">
              {subcategory.title}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATUS_LABELS) as StatusEnum[]).map((statusKey) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setSelectedStatus(statusKey)}
                  className={`px-3 py-2 text-xs rounded-md border font-medium transition-all ${
                    selectedStatus === statusKey
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {STATUS_LABELS[statusKey]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Update</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="E.g., Verified manually in staging..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Evidence URL (Optional)</label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="https://github.com/..."
            />
          </div>

          {currentStatus?.lastUpdatedBy === 'system_agent' && (
             <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-md text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Overriding a system-reported status will create a conflict record in the audit logs.</p>
             </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-sm"
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
