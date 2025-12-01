import React from 'react';
import { Agent, AgentType, AgentEvent } from '../types';
import { Terminal, Github, Bot, RefreshCw, Play, FileCode, Server, Sparkles, ScanLine } from 'lucide-react';

interface AgentPanelProps {
  agents: Agent[];
  onSimulateEvent: (event: Partial<AgentEvent>) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ agents, onSimulateEvent }) => {
  const getIcon = (type: AgentType) => {
    switch (type) {
      case AgentType.VSCODE: return <Terminal className="w-5 h-5 text-blue-500" />;
      case AgentType.GITHUB: return <Github className="w-5 h-5 text-slate-900" />;
      case AgentType.CURSOR: return <Bot className="w-5 h-5 text-indigo-500" />;
      default: return <Bot className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Agent List */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Connected Agents</h3>
          <button className="text-slate-400 hover:text-slate-600">
              <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2 grid grid-cols-1 gap-2">
          {agents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100">
                          {getIcon(agent.type)}
                      </div>
                      <div>
                          <p className="text-sm font-medium text-slate-900 capitalize">{agent.type}</p>
                          <p className="text-xs text-slate-500">Last seen: {new Date(agent.lastSeen).toLocaleTimeString()}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`} />
                  </div>
              </div>
          ))}
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-indigo-50/50 flex items-center gap-2">
          <Play className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Event Simulator</h3>
        </div>
        <div className="p-4 space-y-3">
            <p className="text-xs text-slate-500 mb-2">Trigger agent events to test the Rules Engine.</p>
            
            <button 
                onClick={() => onSimulateEvent({
                    type: 'file_saved',
                    agentId: 'a1', 
                    payload: { path: 'src/infra/Dockerfile', content: 'FROM node:18\nRUN...' }
                })}
                className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200 rounded-lg transition-all group"
            >
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileCode className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-bold">Save Dockerfile</div>
                    <div className="text-xs text-slate-500 font-normal">VS Code Agent • file_saved</div>
                </div>
            </button>
            
            {/* Generalized Detection Button */}
            <button 
                onClick={() => onSimulateEvent({
                    type: 'file_saved',
                    agentId: 'a1', 
                    payload: { 
                        path: 'package.json', 
                        content: JSON.stringify({
                            dependencies: {
                                "prisma": "^5.0.0",
                                "auth0-js": "^9.0.0",
                                "jest": "^29.0.0",
                                "react": "^18.0.0"
                            }
                        }, null, 2)
                    }
                })}
                className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200 rounded-lg transition-all group"
            >
                <div className="p-2 bg-fuchsia-100 text-fuchsia-600 rounded-md group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                    <ScanLine className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-bold">Scan package.json (General)</div>
                    <div className="text-xs text-slate-500 font-normal">Gemini Analysis • Detect Stack</div>
                </div>
            </button>

            <button 
                onClick={() => onSimulateEvent({
                    type: 'ci_pipeline',
                    agentId: 'a5',
                    payload: { status: 'success', workflow: 'build-and-test', artifacts: ['docker-image'] }
                })}
                className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200 rounded-lg transition-all group"
            >
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Server className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-bold">CI Build Success</div>
                    <div className="text-xs text-slate-500 font-normal">GitHub Actions • ci_pipeline</div>
                </div>
            </button>

            <button 
                onClick={() => onSimulateEvent({
                    type: 'ai_action',
                    agentId: 'a3',
                    payload: { action: 'generate_tests', target: 'src/auth.test.ts', confidence: 0.92 }
                })}
                className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200 rounded-lg transition-all group"
            >
                <div className="p-2 bg-purple-100 text-purple-600 rounded-md group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-bold">AI Generate Tests</div>
                    <div className="text-xs text-slate-500 font-normal">Cursor Agent • ai_action</div>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};