import React from 'react';
import { Bot, User, CheckCircle2, AlertTriangle, FileText, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { ProjectStatus, Subcategory, StatusEnum, Evidence } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

interface StatusTileProps {
  subcategory: Subcategory;
  status: ProjectStatus;
  onClick: () => void;
  onViewEvidence: (evidence: Evidence[]) => void;
}

export const StatusTile: React.FC<StatusTileProps> = ({ subcategory, status, onClick, onViewEvidence }) => {
  const isAutomated = status.lastUpdatedBy === 'system_agent';
  
  // Format relative time
  const updatedDate = new Date(status.lastUpdatedAt);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - updatedDate.getTime()) / 60000);
  const timeString = diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins/60)}h ago`;

  return (
    <div 
      className={`group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${STATUS_COLORS[status.status]}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-sm truncate pr-2">{subcategory.title}</h4>
        {status.status === StatusEnum.VERIFIED && (
            <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
        )}
        {status.status === StatusEnum.BLOCKED && (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
        )}
      </div>

      {/* Meta Row */}
      <div className="flex items-center justify-between text-xs opacity-80 mt-3">
        <div className="flex items-center gap-1.5">
          {isAutomated ? (
            <div className="flex items-center gap-1 text-slate-600" title={`Automated (Confidence: ${status.confidenceScore}%)`}>
              <Bot className="w-3.5 h-3.5" />
              {status.confidenceScore}%
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-600" title="Manual Override">
              <User className="w-3.5 h-3.5" />
              Manual
            </div>
          )}
        </div>
        <span>{timeString}</span>
      </div>

      {/* Action Overlay (Visible on Hover/Click area) */}
      <div className="absolute inset-0 bg-transparent" onClick={onClick} />

      {/* Evidence Links (Clickable above overlay) */}
      {status.evidence.length > 0 && (
        <div className="relative mt-3 pt-2 border-t border-black/5 flex gap-2 overflow-hidden">
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onViewEvidence(status.evidence);
                }}
                className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider hover:underline"
            >
                <LinkIcon className="w-3 h-3" />
                {status.evidence.length} Evidence
            </button>
        </div>
      )}
    </div>
  );
};
