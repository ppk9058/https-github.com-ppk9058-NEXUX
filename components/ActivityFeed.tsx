import React from 'react';
import { ActivityLog } from '../types';
import { Activity, Bot, User, CircleAlert } from 'lucide-react';

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Activity
        </h3>
        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 animate-pulse">
            Real-time
        </span>
      </div>
      <div className="overflow-y-auto flex-1 p-0">
        <ul className="divide-y divide-slate-100">
            {logs.length === 0 && <li className="p-4 text-sm text-slate-400 text-center">No activity yet...</li>}
            {logs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                            {log.type === 'agent' && <Bot className="w-4 h-4 text-blue-500" />}
                            {log.type === 'update' && <User className="w-4 h-4 text-slate-500" />}
                            {log.type === 'alert' && <CircleAlert className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-xs text-slate-700 leading-snug">{log.message}</p>
                            <span className="text-[10px] text-slate-400 block">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};