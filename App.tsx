
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Project, Environment, ProjectStatus, Evidence, StatusEnum, ActivityLog,
  Agent, AgentType, AgentEvent, EvidenceType, StatusHistoryEntry, Comment
} from './types';
import { 
  CATEGORIES, SUBCATEGORIES, PROJECTS, ENVIRONMENTS, 
  INITIAL_STATUSES, MOCK_AGENTS, STATUS_LABELS, MOCK_METRICS
} from './constants';
import { StatusTile } from './components/StatusTile';
import { SkeletonTile } from './components/SkeletonTile';
import { UpdateStatusModal } from './components/UpdateStatusModal';
import { EvidenceModal } from './components/EvidenceModal';
import { HistoryModal } from './components/HistoryModal';
import { CommentsModal } from './components/CommentsModal';
import { ExportModal } from './components/ExportModal';
import { ActivityFeed } from './components/ActivityFeed';
import { AgentPanel } from './components/AgentPanel';
import { CategorySection } from './components/CategorySection';
import { DashboardMetrics } from './components/DashboardMetrics';
import { CircularProgress } from './components/CircularProgress';
import { ChevronDown, Search, Filter, Moon, Sun, Download, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
  // --- Persistence Initializers ---
  const getInitialStatuses = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('devstatus_statuses');
        if (saved) return JSON.parse(saved);
    }
    return INITIAL_STATUSES;
  };

  const getInitialLogs = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('devstatus_logs');
        if (saved) return JSON.parse(saved);
    }
    return [];
  };

  const getInitialAgents = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('devstatus_agents');
        if (saved) return JSON.parse(saved);
    }
    return MOCK_AGENTS;
  };

  // --- State ---
  const [currentProject, setCurrentProject] = useState<Project>(PROJECTS[0]);
  const [currentEnv, setCurrentEnv] = useState<Environment>(ENVIRONMENTS[0]); // Defaults to dev
  const [statuses, setStatuses] = useState<ProjectStatus[]>(getInitialStatuses);
  const [logs, setLogs] = useState<ActivityLog[]>(getInitialLogs);
  const [agents, setAgents] = useState<Agent[]>(getInitialAgents);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // New: Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusEnum | 'all'>('all');

  // Modals
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [viewingEvidenceId, setViewingEvidenceId] = useState<string | null>(null);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [viewingCommentsId, setViewingCommentsId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

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

  const viewingHistory = viewingHistoryId
    ? statuses.find(s => s.id === viewingHistoryId)?.history || []
    : [];

  const viewingComments = viewingCommentsId
    ? statuses.find(s => s.id === viewingCommentsId)?.comments || []
    : [];
  
  const viewingCommentsTitle = viewingCommentsId
    ? SUBCATEGORIES.find(s => s.id === statuses.find(st => st.id === viewingCommentsId)?.subcategoryId)?.title || 'Check'
    : 'Check';

  // --- Persistence Effects ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('devstatus_statuses', JSON.stringify(statuses));
    }
  }, [statuses]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('devstatus_logs', JSON.stringify(logs));
    }
  }, [logs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('devstatus_agents', JSON.stringify(agents));
    }
  }, [agents]);

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Loading Effect on Env Switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [currentEnv]);

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

  // Helper to update a status
  const applyUpdate = useCallback((subSlug: string, newStatus: StatusEnum, confidence: number, explanation: string, evidenceType: EvidenceType, evidenceLabel: string) => {
    // Find subcategory that matches the slug AND matches the current environment stage
    const sub = SUBCATEGORIES.find(s => s.slug === subSlug && s.stages.includes(currentEnv.name));
    if (!sub) return;

    setStatuses(prev => prev.map(s => {
        if (s.subcategoryId === sub.id && s.envId === currentEnv.id) {
            
            // Anomaly Detection: Check for suspicious velocity
            if (s.status === StatusEnum.NOT_STARTED && newStatus === StatusEnum.VERIFIED) {
                 addLog(`Anomaly detected: Suspicious jump to VERIFIED for ${sub.title}`, 'alert');
            }

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

            const historyEntry: StatusHistoryEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                actor: 'System Agent',
                previousStatus: s.status,
                newStatus: newStatus,
                reason: explanation
            };

            addLog(`Matched: ${sub.title} -> ${newStatus} (${confidence}%)`, 'agent', confidence);

            return {
                ...s,
                status: newStatus,
                lastUpdatedAt: new Date().toISOString(),
                lastUpdatedBy: 'system_agent',
                confidenceScore: confidence,
                aiExplanation: explanation,
                evidence: [newEvidence, ...s.evidence],
                history: [historyEntry, ...s.history]
            };
        }
        return s;
    }));
  }, [addLog, currentEnv]);

  // --- Gemini AI Analysis ---
  const analyzeManifestWithGemini = async (filename: string, content: string) => {
    try {
        const apiKey = typeof process !== 'undefined' ? process.env?.API_KEY : undefined;
        let aiResponse = [];

        if (!apiKey) {
            // SIMULATED INTELLIGENCE
            const KEYWORD_MAPPINGS: Record<string, { slug: string, reason: string }> = {
                // Dev - Infra
                'postgres': { slug: 'db-local', reason: 'Detected PostgreSQL dependency' },
                'supabase': { slug: 'db-local', reason: 'Detected Supabase client' },
                'react': { slug: 'fe-be-sep', reason: 'Detected React Frontend' },
                'next': { slug: 'fe-be-sep', reason: 'Detected Next.js Framework' },
                'dotenv': { slug: 'env-vars', reason: 'Detected dotenv' },
                
                // Dev - Workflow
                'jest': { slug: 'unit-tests', reason: 'Detected Jest' },
                'vitest': { slug: 'unit-tests', reason: 'Detected Vitest' },
                
                // Dev - Advanced
                'auth0': { slug: 'auth-local', reason: 'Detected Auth0 SDK' },
                'passport': { slug: 'auth-local', reason: 'Detected Passport.js' },

                // Staging - Ops
                'k6': { slug: 'load-test', reason: 'Detected K6 Load Testing' },

                // Staging - IaC
                '@pulumi/pulumi': { slug: 'terraform', reason: 'Detected Pulumi IaC' },

                // Prod - Monitor
                'winston': { slug: 'logs-live', reason: 'Detected Winston Logger' },
                
                // Prod - Biz
                'mixpanel': { slug: 'mixpanel', reason: 'Detected Mixpanel SDK' }
            };

            Object.keys(KEYWORD_MAPPINGS).forEach(keyword => {
                if (content.toLowerCase().includes(keyword)) {
                    aiResponse.push({
                        slug: KEYWORD_MAPPINGS[keyword].slug,
                        status: 'in_progress',
                        reason: KEYWORD_MAPPINGS[keyword].reason,
                        confidence: 90
                    });
                }
            });
        } else {
             // REAL GEMINI CALL
            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `
                Analyze this ${filename} file and map its dependencies to the following project subcategories.
                
                Subcategories: ${JSON.stringify(SUBCATEGORIES.map(s => ({ slug: s.slug, title: s.title, stages: s.stages })))}

                File Content:
                ${content}

                Return a JSON array of objects with keys: "slug", "status" (enum: in_progress, done), "reason", "confidence" (0-100).
                Only return matches found in the file.
            `;

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                slug: { type: Type.STRING },
                                status: { type: Type.STRING },
                                reason: { type: Type.STRING },
                                confidence: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            });
            if (result.text) {
                aiResponse = JSON.parse(result.text);
            }
        }

        // Apply Updates
        aiResponse.forEach((match: any) => {
            let statusEnum = StatusEnum.IN_PROGRESS;
            if (match.status === 'done') statusEnum = StatusEnum.DONE;
            applyUpdate(match.slug, statusEnum, match.confidence, `Gemini: ${match.reason}`, 'file', filename);
        });

        if (aiResponse.length > 0) {
            addLog(`Gemini analyzed ${filename} and found ${aiResponse.length} matches across lifecycle stages`, 'ai');
        }

    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        addLog("Gemini analysis failed", 'alert');
    }
  };


  // --- Rules Engine ---
  const processRules = useCallback(async (event: AgentEvent) => {
    // Rule 1: Generalized Dependency Analysis
    if (event.type === 'file_saved' && (event.payload.path?.endsWith('package.json'))) {
        addLog(`Analyzing ${event.payload.path} dependencies...`, 'ai');
        await analyzeManifestWithGemini(event.payload.path, event.payload.content || '');
        return; 
    }
    
    // Quick Fix Simulation Handler
    if (event.type === 'local_command' && event.payload.command === 'open_file') {
        addLog(`Opening ${event.payload.file} in VS Code...`, 'agent');
        // Simulate a fix after 2 seconds
        setTimeout(() => {
             addLog(`Engineer fixed ${event.payload.file}. updating status...`, 'update');
             if (event.payload.file.includes('Dockerfile')) {
                 applyUpdate('docker-basics', StatusEnum.IN_PROGRESS, 80, 'Manual fix applied in IDE', 'file', event.payload.file);
             }
        }, 2000);
        return;
    }

    // Webhook Handler
    if (event.type === 'ci_pipeline' && event.agentId === 'webhook') {
         if (event.payload.status === 'success') {
             applyUpdate('gh-actions', StatusEnum.DONE, 100, 'Webhook: CI Passed', 'pipeline', 'GH Action #123');
             applyUpdate('auto-test-ci', StatusEnum.DONE, 100, 'Webhook: Tests Passed', 'pipeline', 'GH Action #123');
         }
         return;
    }

    // Standard Rules
    if (event.type === 'file_saved' && event.payload.path?.includes('Dockerfile')) {
        applyUpdate('docker-basics', StatusEnum.IN_PROGRESS, 75, 'Agent detected Dockerfile modification', 'file', 'src/infra/Dockerfile');
    }

    if (event.type === 'ci_pipeline' && event.payload.status === 'success') {
        applyUpdate('auto-test-ci', StatusEnum.DONE, 98, 'CI Pipeline passed', 'pipeline', 'GitHub Actions Run #88');
    }

    if (event.type === 'ai_action' && event.payload.action === 'generate_tests') {
        applyUpdate('unit-tests', StatusEnum.IN_PROGRESS, 85, 'Cursor generated unit tests', 'ai_chat', 'Cursor Chat Session');
    }

  }, [addLog, applyUpdate]);

  const handleSimulateEvent = (partialEvent: Partial<AgentEvent>) => {
    const event: AgentEvent = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        agentId: 'sim',
        type: 'file_saved',
        payload: {},
        ...partialEvent
    };
    if (partialEvent.agentId) event.agentId = partialEvent.agentId;
    
    addLog(`Received event: ${event.type}`, 'agent');
    processRules(event);
  };

  const handleManualUpdate = (subcategoryId: string, newStatus: StatusEnum, reason: string, evidenceUrl?: string, evidenceType: EvidenceType = 'pr') => {
    setStatuses(prev => prev.map(s => {
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
            
            const historyEntry: StatusHistoryEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                actor: 'User (JD)',
                previousStatus: s.status,
                newStatus: newStatus,
                reason: reason
            };

            addLog(`User manually updated ${SUBCATEGORIES.find(sub => sub.id === subcategoryId)?.title} to ${newStatus}`, 'update');

            return {
                ...s,
                status: newStatus,
                lastUpdatedAt: new Date().toISOString(),
                lastUpdatedBy: 'user_1',
                confidenceScore: 100,
                aiExplanation: undefined,
                evidence: newEvidence,
                history: [historyEntry, ...s.history]
            };
        }
        return s;
    }));
  };

  // --- Comments Logic ---
  const handleAddComment = (text: string) => {
    if (!viewingCommentsId) return;

    const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        author: 'User (JD)',
        text: text,
        timestamp: new Date().toISOString()
    };

    setStatuses(prev => prev.map(s => {
        if (s.id === viewingCommentsId) {
            return {
                ...s,
                comments: [newComment, ...(s.comments || [])]
            };
        }
        return s;
    }));
    
    addLog(`Comment added to ${viewingCommentsTitle}`, 'update');
  };
  
  const handleExport = (format: 'json' | 'csv') => {
      const dataToExport = statuses.filter(s => s.envId === currentEnv.id).map(s => {
          const sub = SUBCATEGORIES.find(sub => sub.id === s.subcategoryId);
          return {
              category: CATEGORIES.find(c => c.id === sub?.categoryId)?.title,
              subcategory: sub?.title,
              status: s.status,
              updatedAt: s.lastUpdatedAt,
              updatedBy: s.lastUpdatedBy,
              evidenceCount: s.evidence.length
          };
      });

      let content = '';
      let type = '';
      let extension = '';

      if (format === 'json') {
          content = JSON.stringify(dataToExport, null, 2);
          type = 'application/json';
          extension = 'json';
      } else {
          // CSV
          const headers = ['Category', 'Subcategory', 'Status', 'Updated At', 'Updated By', 'Evidence Count'];
          const rows = dataToExport.map(d => [d.category, d.subcategory, d.status, d.updatedAt, d.updatedBy, d.evidenceCount].join(','));
          content = [headers.join(','), ...rows].join('\n');
          type = 'text/csv';
          extension = 'csv';
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devstatus_audit_${currentEnv.name}_${new Date().toISOString()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportModal(false);
      addLog(`Report exported as ${format.toUpperCase()}`, 'update');
  };

  // Compute Overall Health
  const currentEnvStatuses = statuses.filter(s => s.envId === currentEnv.id);
  const progressPercent = currentEnvStatuses.length > 0 ? Math.round(
    (currentEnvStatuses.filter(s => s.status === StatusEnum.DONE || s.status === StatusEnum.VERIFIED).length / currentEnvStatuses.length) * 100
  ) : 0;

  // Filtering Logic
  const filteredCategories = CATEGORIES.map(cat => {
    if (!cat.stages.includes(currentEnv.name)) return null;

    const categorySubs = SUBCATEGORIES.filter(sub => sub.categoryId === cat.id);
    const visibleSubs = categorySubs.filter(sub => {
        if (!sub.stages.includes(currentEnv.name)) return false;
        const status = statuses.find(s => s.subcategoryId === sub.id && s.envId === currentEnv.id);
        if (!status) return false;
        
        // Search Filter
        if (searchQuery && !sub.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        // Status Filter
        if (statusFilter !== 'all' && status.status !== statusFilter) return false;
        
        // Focus Mode Filter: Hide 'done' and 'verified' if focus mode is active
        if (isFocusMode && (status.status === StatusEnum.DONE || status.status === StatusEnum.VERIFIED)) return false;

        return true;
    });

    return { ...cat, visibleSubs };
  }).filter(cat => cat !== null && cat.visibleSubs.length > 0);


  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-lg">DS</div>
                    <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">DevStatus</span>
                </div>

                <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700 h-8">
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                           {currentProject.name} <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
                        {ENVIRONMENTS.map(env => (
                            <button
                                key={env.id}
                                onClick={() => {
                                    setCurrentEnv(env);
                                    setSearchQuery(''); 
                                    setStatusFilter('all'); 
                                }}
                                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                                    currentEnv.id === env.id 
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                {env.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3 mr-2">
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Health ({currentEnv.name})</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {progressPercent}% Complete
                        </span>
                    </div>
                    <CircularProgress percentage={progressPercent} size={42} strokeWidth={4} showText={false} />
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block" />
                
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export
                </button>

                <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer shadow-md border-2 border-white dark:border-slate-800">
                    JD
                </div>
            </div>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search checks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                />
             </div>
             
             <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                 {/* Focus Mode Toggle */}
                 <button
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${
                        isFocusMode 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                 >
                    {isFocusMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    Focus Mode
                 </button>

                 <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

                 <div className="flex items-center gap-2">
                     <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
                     <button 
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${statusFilter === 'all' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                     >
                        All
                     </button>
                     {(Object.keys(STATUS_LABELS) as StatusEnum[]).map(status => (
                         <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${statusFilter === status ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                         >
                            {STATUS_LABELS[status]}
                         </button>
                     ))}
                 </div>
             </div>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row gap-6 pt-6 pb-2">
            
            {/* Left: Dashboard Grid */}
            <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
                <DashboardMetrics metrics={MOCK_METRICS[currentEnv.name]} stageName={currentEnv.name} />

                <div className="space-y-4">
                    {filteredCategories.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>No checks match your filters for {currentEnv.name.toUpperCase()}.</p>
                            {isFocusMode && <p className="text-xs mt-2 text-indigo-500">Focus Mode is ON (hiding completed items)</p>}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1,2,3,4,5,6,7,8].map(i => <SkeletonTile key={i} />)}
                        </div>
                    ) : (
                        filteredCategories.map((category) => (
                            <CategorySection key={category!.id} category={category!} count={category!.visibleSubs.length}>
                                {category!.visibleSubs.map(sub => {
                                    const status = statuses.find(s => s.subcategoryId === sub.id && s.envId === currentEnv.id);
                                    if(!status) return null;
                                    return (
                                        <StatusTile 
                                            key={sub.id} 
                                            subcategory={sub} 
                                            status={status}
                                            onClick={() => setEditingSubcategoryId(sub.id)}
                                            onViewEvidence={() => setViewingEvidenceId(status.id)}
                                            onViewHistory={() => setViewingHistoryId(status.id)}
                                            onViewComments={() => setViewingCommentsId(status.id)}
                                            onQuickFix={(payload) => handleSimulateEvent({ ...payload, agentId: 'sim_fix' })}
                                            isFocusMode={isFocusMode}
                                        />
                                    );
                                })}
                            </CategorySection>
                        ))
                    )}
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

      <HistoryModal
        isOpen={!!viewingHistoryId}
        onClose={() => setViewingHistoryId(null)}
        history={viewingHistory}
      />

      <CommentsModal
        isOpen={!!viewingCommentsId}
        onClose={() => setViewingCommentsId(null)}
        comments={viewingComments}
        onAddComment={handleAddComment}
        title={viewingCommentsTitle}
      />

      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        projectName={currentProject.name}
        stageName={currentEnv.name}
      />

    </div>
  );
};

export default App;
