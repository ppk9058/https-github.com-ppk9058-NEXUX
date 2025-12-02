
import React, { useState, useEffect } from 'react';
import { Bot, User, CircleCheck, Sparkles, Link as LinkIcon, GitPullRequest, Terminal, FileCode, Server, Image, Box, MessageSquare, History, Wrench } from 'lucide-react';
import { ProjectStatus, Subcategory, StatusEnum, Evidence, EvidenceType } from '../types';
import { STATUS_STYLES, STATUS_LABELS } from '../constants';

interface StatusTileProps {
  subcategory: Subcategory;
  status: ProjectStatus;
  onClick: () => void;
  onViewEvidence: (evidence: Evidence[]) => void;
  onViewHistory: () => void;
  onViewComments: () => void;
  onQuickFix: (payload: any) => void;
  isFocusMode: boolean;
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

export const StatusTile: React.FC<StatusTileProps> = ({ subcategory, status, onClick, onViewEvidence, onViewHistory, onViewComments, onQuickFix, isFocusMode }) => {
  const isAutomated = status.lastUpdatedBy === 'system_agent';
  const isCritical = status.status === StatusEnum.BLOCKED || status.status === StatusEnum.NOT_STARTED;
  
  // State to control the visibility of the critical ping animation
  const [showPing, setShowPing] = useState(false);

  // Trigger ping only on mount (stage switch) if critical, and hide after 5 seconds
  useEffect(() => {
    if (isCritical) {
        setShowPing(true);
        const timer = setTimeout(() => {
            setShowPing(false);
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array ensures this runs only when the component mounts (e.g. switching env tabs)

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
    <div className={`relative group p-4 rounded-xl border transition-all duration-300 ${STATUS_STYLES[status.status]} flex flex-col justify-between h-40 ${isFocusMode && !isCritical ? 'opacity-50 grayscale' : ''}`}>
      
      {/* Quick Fix Badge / Focus Indicator - Shows for 5s on stage switch */}
      {showPing && (
          <div className="absolute top-0 right-0 p-1">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
          </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-sm leading-tight pr-5 line-clamp-2 text-slate-800 dark:text-slate-100" title={subcategory.title}>
          {subcategory.title}
        </h3>
        {subcategory.required && !isCritical && (
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
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
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
      <div className="flex justify-between items-end pt-3 border-t border-black/5 dark:border-white/5">
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

         <div className="flex items-center gap-1">
             {/* Evidence Icons */}
             {status.evidence.length > 0 && (
                <div 
                  className="flex -space-x-1.5 cursor-pointer hover:opacity-80 transition-opacity mr-1"
                  onClick={(e) => { e.stopPropagation(); onViewEvidence(status.evidence); }}
                  title={`${status.evidence.length} items attached`}
                >
                    {uniqueEvidenceTypes.slice(0, 3).map((type, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm z-0">
                            {getEvidenceIcon(type)}
                        </div>
                    ))}
                </div>
             )}
            
            {/* Quick Fix Button (only for problematic statuses) */}
             {(status.status === StatusEnum.BLOCKED || status.status === StatusEnum.NOT_STARTED) && (
                 <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onQuickFix({ 
                            type: 'local_command', 
                            payload: { command: 'open_file', file: 'src/fix_me.ts' } 
                        }); 
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-all"
                    title="Quick Fix (Simulated)"
                 >
                     <Wrench className="w-3.5 h-3.5" />
                 </button>
             )}

             {/* Comments Button */}
             <button 
                onClick={(e) => { e.stopPropagation(); onViewComments(); }}
                className={`p-1.5 rounded-md transition-all flex items-center gap-1 ${status.comments?.length > 0 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
                title="Comments"
             >
                 <MessageSquare className="w-3.5 h-3.5" />
                 {status.comments?.length > 0 && <span className="text-[9px] font-bold">{status.comments.length}</span>}
             </button>

             {/* History Button */}
             <button 
                onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-all"
                title="View History"
             >
                 <History className="w-3.5 h-3.5" />
             </button>

             {/* Update Button */}
             <button 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="ml-1 px-2.5 py-1 text-[10px] font-semibold border border-current rounded bg-white/40 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-colors shadow-sm"
             >
                 Update
             </button>
         </div>
      </div>
    </div>
  );
};
