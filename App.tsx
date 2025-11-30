import React, { useState, useEffect, useCallback } from 'react';
import { 
  Project, Environment, ProjectStatus, Evidence, StatusEnum, ActivityLog,
  Agent, AgentType
} from './types';
import { 
  CATEGORIES, SUBCATEGORIES, PROJECTS, ENVIRONMENTS, 
  INITIAL_STATUSES, MOCK_AGENTS 
} from './constants';
import { StatusTile } from './components/StatusTile';
import { UpdateStatusModal } from './components/UpdateStatusModal';
import { EvidenceModal } from './components/EvidenceModal';
import { ActivityFeed } from './components/ActivityFeed';
import { AgentPanel } from './components/AgentPanel';
import { LayoutDashboard, Settings, ChevronDown, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [currentProject, setCurrentProject] = useState<Project>(PROJECTS[0]);
  const [currentEnv, setCurrentEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [statuses, setStatuses] = useState<ProjectStatus[]>(INITIAL_STATUSES);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);

  // Modals
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [viewingEvidenceId, setViewingEvidenceId] = useState<string | null>(null);

  // Derived state for modals
  const editingStatus = editingSubcategoryId 
    ? statuses.find(s => s.subcategoryId === editingSubcategoryId) 
    : null;
  const editingSubcategory = editingSubcategoryId
    ? SUBCATEGORIES.find(s => s.id === editingSubcategoryId)
    : null;
  
  const viewingEvidence = viewingEvidenceId
    ? statuses.find(s => s.id === viewingEvidenceId)?.evidence || []
    : [];

  // --- Logic ---

  // Helper to add log
  const addLog = useCallback((message: string, type: ActivityLog['type'] = 'update') => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date().toISOString(),
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  // Simulate Real-time Agent Updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random subcategory to update
      const randomSub = SUBCATEGORIES[Math.floor(Math.random() * SUBCATEGORIES.length)];
      
      // 30% chance of event
      if (Math.random() > 0.7) {
        setStatuses(prev => prev.map(s => {
          if (s.subcategoryId === randomSub.id) {
             // Don't override verified status automatically in this simulation unless specific logic
             if (s.status === StatusEnum.VERIFIED) return s;

             const newStatus = Math.random() > 0.5 ? StatusEnum.DONE : StatusEnum.IN_PROGRESS;
             
             if (newStatus !== s.status) {
                addLog(`Agent detected change in ${randomSub.title}: ${newStatus}`, 'agent');
                return {
                    ...s,
                    status: newStatus,
                    lastUpdatedAt: new Date().toISOString(),
                    lastUpdatedBy: 'system_agent',
                    confidenceScore: Math.floor(Math.random() * 20) + 80, // 80-99%
                    evidence: [
                        ...s.evidence,
                        {
                            id: Math.random().toString(),
                            type: 'console_log',
                            url: '#',
                            label: `Auto-detected via ${currentProject.repoUrl}`,
                            createdAt: new Date().toISOString()
                        }
                    ]
                };
             }
          }
          return s;
        }));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [addLog, currentProject]);


  // Handle Manual Update
  const handleUpdateStatus = (subcategoryId: string, newStatus: StatusEnum, reason: string, evidenceUrl?: string) => {
    setStatuses(prev => prev.map(s => {
        if (s.subcategoryId === subcategoryId) {
            const newEvidence: Evidence[] = evidenceUrl ? [
                ...s.evidence,
                {
                    id: Math.random().toString(),
                    type: 'pr', // default for manual
                    url: evidenceUrl,
                    label: 'Manual Evidence',
                    createdAt: new Date().toISOString()
                }
            ] : s.evidence;

            addLog(`User manually updated ${SUBCATEGORIES.find(sub => sub.id === subcategoryId)?.title} to ${newStatus}`, 'update');

            return {
                ...s,
                status: newStatus,
                lastUpdatedAt: new Date().toISOString(),
                lastUpdatedBy: 'user_1', // Mock user
                confidenceScore: 100,
                evidence: newEvidence
            };
        }
        return s;
    }));
  };

  // Compute Overall Health for Header
  const progressPercent = Math.round(
    (statuses.filter(s => s.status === StatusEnum.DONE || s.status === StatusEnum.VERIFIED).length / statuses.length) * 100
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">DS</div>
                    <span className="font-bold text-xl tracking-tight text-slate-800">DevStatus</span>
                </div>

                {/* Project Selector */}
                <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-50">
                           {currentProject.name} <ChevronDown className="w-3 h-3" />
                        </button>
                        {/* Dropdown would go here */}
                    </div>
                    <span className="text-slate-300">/</span>
                    <div className="flex bg-slate-100 rounded-md p-0.5">
                        {ENVIRONMENTS.map(env => (
                            <button
                                key={env.id}
                                onClick={() => setCurrentEnv(env)}
                                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                                    currentEnv.id === env.id 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {env.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-4">
                    <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Project Health</span>
                    <div className="flex items-center gap-2">
                         <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                         </div>
                         <span className="text-sm font-bold text-slate-700">{progressPercent}%</span>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer">
                    JD
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row gap-6 pt-6 pb-2">
            
            {/* Left: Dashboard Grid */}
            <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
                <div className="space-y-8">
                    {CATEGORIES.sort((a,b) => a.order - b.order).map(category => {
                        const categorySubs = SUBCATEGORIES.filter(s => s.categoryId === category.id);
                        if(categorySubs.length === 0) return null;

                        return (
                            <div key={category.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-baseline justify-between mb-4 border-b border-slate-200 pb-2">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">{category.title}</h2>
                                        <p className="text-xs text-slate-500">{category.description}</p>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">{categorySubs.length} Checks</span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {categorySubs.map(sub => {
                                        const status = statuses.find(s => s.subcategoryId === sub.id);
                                        if(!status) return null;
                                        return (
                                            <StatusTile 
                                                key={sub.id} 
                                                subcategory={sub} 
                                                status={status}
                                                onClick={() => setEditingSubcategoryId(sub.id)}
                                                onViewEvidence={() => setViewingEvidenceId(status.id)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Sidebar */}
            <div className="hidden md:flex flex-col w-80 gap-6 h-full pb-6 sticky top-0">
                <AgentPanel agents={agents} />
                <ActivityFeed logs={logs} />
            </div>

        </div>
      </main>

      {/* Modals */}
      <UpdateStatusModal 
        isOpen={!!editingSubcategoryId}
        onClose={() => setEditingSubcategoryId(null)}
        subcategory={editingSubcategory || null}
        currentStatus={editingStatus || null}
        onUpdate={handleUpdateStatus}
      />
      
      <EvidenceModal
        isOpen={!!viewingEvidenceId}
        onClose={() => setViewingEvidenceId(null)}
        evidence={viewingEvidence}
      />

    </div>
  );
};

export default App;
