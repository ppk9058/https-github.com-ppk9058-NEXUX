import React from 'react';
import { Bot, User, CircleCheck, Sparkles, Link as LinkIcon, GitPullRequest, Terminal, FileCode, Server, Image, Box, MessageSquare } from 'lucide-react';
import { ProjectStatus, Subcategory, StatusEnum, Evidence, EvidenceType } from '../types';
import { STATUS_STYLES, STATUS_LABELS } from '../constants';

interface StatusTileProps {
  subcategory: Subcategory;
  status: ProjectStatus;
  onClick: () => void;
  onViewEvidence: (evidence: Evidence[]) => void;
}

const getEvidenceIcon = (type: EvidenceType) => {
    switch (type) {
      case 'pr': return <GitPullRequest className="w-3 h-3" />;
      case 'pipeline': return <Server className="w-3 h-3" />;
      case 'console_log': return <Terminal className="w-3 h-3" />;
      case 'file': return <FileCode className="w-3 h-3" />;
      case 'screenshot': return <Image className="w-3 h-3" />;
      case 'artifact': return <Box className="w-3 h-3" />;
      case 'ai_chat': return <MessageSquare className="w-3 h-3" />;
      default: return <LinkIcon className="w-3 h-3" />;
    }
};

export const StatusTile: React.FC<StatusTileProps> = ({ subcategory, status, onClick, onViewEvidence }) => {
  const isAutomated = status.lastUpdatedBy === 'system_agent';
  
  // Format relative time
  const updatedDate = new Date(status.lastUpdatedAt);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - updatedDate.getTime()) / 60000);
  const timeString = diffMins < 60 ? `${diffMins}m ago` : diffMins < 1440 ? `${Math.floor(diffMins/60)}h ago` : `${Math.floor(diffMins/1440)}d ago`;

  // Determine confidence color
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const uniqueEvidenceTypes = Array.from(new Set(status.evidence.map(e => e.type)));

  return (
    <div className={`relative group p-4 rounded-xl border transition-all duration-300 ${STATUS_STYLES[status.status]} flex flex-col justify-between h-40`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-sm leading-tight pr-5 line-clamp-2 text-slate-800" title={subcategory.title}>
          {subcategory.title}
        </h3>
        {subcategory.required && (
             <span className="absolute top-4 right-4 text-[9px] uppercase font-bold tracking-wider opacity-40 border border-current px-1 rounded-sm">Req</span>
        )}
      </div>

      {/* Body: Status Info */}
      <div className="flex-1 flex flex-col justify-center">
         <div className="flex items-center gap-1.5 mb-1.5">
             <span className={`text-xs font-bold uppercase tracking-wide`}>
                {STATUS_LABELS[status.status]}
             </span>
             {status.status === StatusEnum.VERIFIED && <CircleCheck className="w-3.5 h-3.5" />}
         </div>
         
         {/* AI Confidence Bar (if automated) */}
         {isAutomated && status.confidenceScore > 0 && (
             <div className="group/confidence relative mt-1">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] opacity-60 font-mono flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Verified
                    </span>
                    <span className="text-[10px] font-bold opacity-80">{status.confidenceScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${getConfidenceColor(status.confidenceScore)}`} 
                        style={{ width: `${status.confidenceScore}%` }} 
                    />
                </div>
                
                {/* Tooltip for Explanation */}
                {status.aiExplanation && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 p-2 bg-slate-800 text-white text-xs rounded-md shadow-xl opacity-0 group-hover/confidence:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="font-semibold mb-0.5 border-b border-white/20 pb-0.5">Reasoning</div>
                        {status.aiExplanation}
                    </div>
                )}
             </div>
         )}
      </div>

      {/* Footer: Meta & Actions */}
      <div className="flex justify-between items-end pt-3 border-t border-black/5">
         <div className="flex items-center gap-2 text-xs opacity-60">
             {isAutomated ? (
               <span title="Updated by System Agent">
                 <Bot className="w-3.5 h-3.5" />
               </span>
             ) : (
               <span title="Updated Manually">
                 <User className="w-3.5 h-3.5" />
               </span>
             )}
             <span>{timeString}</span>
         </div>

         <div className="flex items-center gap-2">
             {/* Evidence Icons */}
             {status.evidence.length > 0 && (
                <div 
                  className="flex -space-x-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); onViewEvidence(status.evidence); }}
                  title={`${status.evidence.length} items attached`}
                >
                    {uniqueEvidenceTypes.slice(0, 3).map((type, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm z-0">
                            {getEvidenceIcon(type)}
                        </div>
                    ))}
                    {uniqueEvidenceTypes.length > 3 && (
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm z-10">
                            +{uniqueEvidenceTypes.length - 3}
                        </div>
                    )}
                </div>
             )}

             <button 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="px-2.5 py-1 text-[10px] font-semibold border border-current rounded bg-white/40 hover:bg-white/80 transition-colors shadow-sm"
             >
                 Update
             </button>
         </div>
      </div>
    </div>
  );
};