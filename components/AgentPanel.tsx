import React from 'react';
import { Agent, AgentType } from '../types';
import { Terminal, Github, Bot, RefreshCw } from 'lucide-react';

interface AgentPanelProps {
  agents: Agent[];
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ agents }) => {
  const getIcon = (type: AgentType) => {
    switch (type) {
      case AgentType.VSCODE: return <Terminal className="w-5 h-5 text-blue-500" />;
      case AgentType.GITHUB: return <Github className="w-5 h-5 text-slate-900" />;
      case AgentType.CURSOR: return <Bot className="w-5 h-5 text-indigo-500" />;
      default: return <Bot className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
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
  );
};
