import React, { useState, useCallback } from 'react';
import { 
  Project, Environment, ProjectStatus, Evidence, StatusEnum, ActivityLog,
  Agent, AgentType, AgentEvent, EvidenceType
} from './types';
import { 
  CATEGORIES, SUBCATEGORIES, PROJECTS, ENVIRONMENTS, 
  INITIAL_STATUSES, MOCK_AGENTS, STATUS_LABELS
} from './constants';
import { StatusTile } from './components/StatusTile';
import { UpdateStatusModal } from './components/UpdateStatusModal';
import { EvidenceModal } from './components/EvidenceModal';
import { ActivityFeed } from './components/ActivityFeed';
import { AgentPanel } from './components/AgentPanel';
import { Settings, ChevronDown, Search, Filter } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [currentProject, setCurrentProject] = useState<Project>(PROJECTS[0]);
  const [currentEnv, setCurrentEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [statuses, setStatuses] = useState<ProjectStatus[]>(INITIAL_STATUSES);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusEnum | 'all'>('all');

  // Modals
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [viewingEvidenceId, setViewingEvidenceId] = useState<string | null>(null);

  // Derived state for modals
  const editingStatus = editingSubcategoryId 
    ? statuses.find(s => s.subcategoryId === editingSubcategoryId && s.envId === currentEnv.id) 
    : null;
  const editingSubcategory = editingSubcategoryId
    ? SUBCATEGORIES.find(s => s.id === editingSubcategoryId)
    : null;
  
  const viewingEvidence = viewingEvidenceId
    ? statuses.find(s => s.id === viewingEvidenceId)?.evidence || []
    : [];

  // --- Logic ---

  const addLog = useCallback((message: string, type: ActivityLog['type'] = 'update', confidence?: number) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date().toISOString(),
      type,
      confidence
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  // --- Rules Engine ---
  const processRules = useCallback((event: AgentEvent) => {
    // Helper to update a status
    const applyUpdate = (subSlug: string, newStatus: StatusEnum, confidence: number, explanation: string, evidenceType: Evidence['type'], evidenceLabel: string) => {
        const sub = SUBCATEGORIES.find(s => s.slug === subSlug);
        if (!sub) return;

        setStatuses(prev => prev.map(s => {
            // ONLY update for current Environment for this demo to show real-time effect
            if (s.subcategoryId === sub.id && s.envId === currentEnv.id) {
                // Don't downgrade verified status automatically
                if (s.status === StatusEnum.VERIFIED && newStatus !== StatusEnum.VERIFIED) {
                    addLog(`Conflict: System tried to update verified ${sub.title}, ignored.`, 'alert');
                    return s;
                }

                const newEvidence: Evidence = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: evidenceType,
                    url: '#',
                    label: evidenceLabel,
                    createdAt: new Date().toISOString()
                };

                addLog(`Rule Matched: ${sub.title} -> ${newStatus} (${confidence}% conf)`, 'agent', confidence);

                return {
                    ...s,
                    status: newStatus,
                    lastUpdatedAt: new Date().toISOString(),
                    lastUpdatedBy: 'system_agent',
                    confidenceScore: confidence,
                    aiExplanation: explanation,
                    evidence: [newEvidence, ...s.evidence]
                };
            }
            return s;
        }));
    };

    // Rule 1: Dockerfile Saved -> Infra: Docker -> In Progress
    if (event.type === 'file_saved' && event.payload.path?.includes('Dockerfile')) {
        applyUpdate('docker', StatusEnum.IN_PROGRESS, 75, 'Agent detected Dockerfile modification', 'file', 'src/infra/Dockerfile');
    }

    // Rule 2: CI Success -> Infra: Docker -> Done
    if (event.type === 'ci_pipeline' && event.payload.status === 'success') {
        applyUpdate('docker', StatusEnum.DONE, 98, 'CI Pipeline built Docker image successfully', 'pipeline', 'Build #482 (GitHub Actions)');
        applyUpdate('build', StatusEnum.DONE, 95, 'Build workflow completed', 'pipeline', 'Build #482 (GitHub Actions)');
    }

    // Rule 3: AI Generated Tests -> Tests: Unit -> In Progress
    if (event.type === 'ai_action' && event.payload.action === 'generate_tests') {
        applyUpdate('unit', StatusEnum.IN_PROGRESS, 85, 'Cursor Agent generated unit tests', 'ai_chat', 'Cursor Chat Session');
    }

  }, [addLog, currentEnv.id]); // added currentEnv.id as dependency

  const handleSimulateEvent = (partialEvent: Partial<AgentEvent>) => {
    const event: AgentEvent = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        agentId: 'sim',
        type: 'file_saved', // default
        payload: {},
        ...partialEvent
    };
    
    // Log raw event
    addLog(`Received event: ${event.type}`, 'agent');
    
    // Process via Rules Engine
    processRules(event);
  };

  // Handle Manual Update
  const handleManualUpdate = (subcategoryId: string, newStatus: StatusEnum, reason: string, evidenceUrl?: string, evidenceType: EvidenceType = 'pr') => {
    setStatuses(prev => prev.map(s => {
        // Only update status for current environment
        if (s.subcategoryId === subcategoryId && s.envId === currentEnv.id) {
            const newEvidence: Evidence[] = evidenceUrl ? [
                {
                    id: Math.random().toString(),
                    type: evidenceType,
                    url: evidenceUrl,
                    label: 'Manual Evidence',
                    createdAt: new Date().toISOString(),
                    verifiedBy: 'user_1'
                },
                ...s.evidence
            ] : s.evidence;

            addLog(`User manually updated ${SUBCATEGORIES.find(sub => sub.id === subcategoryId)?.title} to ${newStatus}`, 'update');

            return {
                ...s,
                status: newStatus,
                lastUpdatedAt: new Date().toISOString(),
                lastUpdatedBy: 'user_1', // Mock user
                confidenceScore: 100,
                aiExplanation: undefined, // Clear AI explanation on manual override
                evidence: newEvidence
            };
        }
        return s;
    }));
  };

  // Compute Overall Health for Header
  const currentEnvStatuses = statuses.filter(s => s.envId === currentEnv.id);
  const progressPercent = currentEnvStatuses.length > 0 ? Math.round(
    (currentEnvStatuses.filter(s => s.status === StatusEnum.DONE || s.status === StatusEnum.VERIFIED).length / currentEnvStatuses.length) * 100
  ) : 0;

  // Filtering Logic
  const filteredCategories = CATEGORIES.map(cat => {
    const categorySubs = SUBCATEGORIES.filter(sub => sub.categoryId === cat.id);
    const visibleSubs = categorySubs.filter(sub => {
        // Filter by Environment
        const status = statuses.find(s => s.subcategoryId === sub.id && s.envId === currentEnv.id);
        if (!status) return false;

        // Filter by Search
        if (searchQuery && !sub.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Filter by Status
        if (statusFilter !== 'all' && status.status !== statusFilter) return false;

        return true;
    });

    return { ...cat, visibleSubs };
  }).filter(cat => cat.visibleSubs.length > 0);


  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">DS</div>
                    <span className="font-bold text-xl tracking-tight text-slate-800">DevStatus</span>
                </div>

                {/* Project Selector */}
                <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200 h-8">
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-50">
                           {currentProject.name} <ChevronDown className="w-3 h-3" />
                        </button>
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

            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Project Health ({currentEnv.name})</span>
                    <div className="flex items-center gap-2">
                         <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                         </div>
                         <span className="text-sm font-bold text-slate-700">{progressPercent}%</span>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer shadow-md border-2 border-white">
                    JD
                </div>
            </div>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="bg-white border-b border-slate-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search checks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
             </div>
             
             <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                 <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
                 <button 
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${statusFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                 >
                    All
                 </button>
                 {(Object.keys(STATUS_LABELS) as StatusEnum[]).map(status => (
                     <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${statusFilter === status ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                     >
                        {STATUS_LABELS[status]}
                     </button>
                 ))}
             </div>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row gap-6 pt-6 pb-2">
            
            {/* Left: Dashboard Grid */}
            <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
                <div className="space-y-8">
                    {filteredCategories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>No checks match your filters.</p>
                        </div>
                    )}

                    {filteredCategories.sort((a,b) => a.order - b.order).map(category => (
                        <div key={category.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-baseline justify-between mb-4 border-b border-slate-200 pb-2">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{category.title}</h2>
                                    <p className="text-xs text-slate-500">{category.description}</p>
                                </div>
                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">{category.visibleSubs.length} Checks</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {category.visibleSubs.map(sub => {
                                    // Find status using BOTH subId and envId
                                    const status = statuses.find(s => s.subcategoryId === sub.id && s.envId === currentEnv.id);
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
                    ))}
                </div>
            </div>

            {/* Right: Sidebar */}
            <div className="hidden md:flex flex-col w-80 gap-6 h-full pb-6 sticky top-0 overflow-y-auto">
                <AgentPanel agents={agents} onSimulateEvent={handleSimulateEvent} />
                <div className="flex-1 min-h-[300px]">
                    <ActivityFeed logs={logs} />
                </div>
            </div>

        </div>
      </main>

      {/* Modals */}
      <UpdateStatusModal 
        isOpen={!!editingSubcategoryId}
        onClose={() => setEditingSubcategoryId(null)}
        subcategory={editingSubcategory || null}
        currentStatus={editingStatus || null}
        onUpdate={handleManualUpdate}
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