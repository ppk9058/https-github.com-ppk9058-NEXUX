
import React from 'react';
import { DoraMetrics } from '../types';
import { Activity, Clock, Zap, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardMetricsProps {
  metrics: DoraMetrics;
  stageName: string;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics, stageName }) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deploy Freq</span>
            <Zap className="w-4 h-4 text-blue-500 opacity-80" />
        </div>
        <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white">{metrics.deploymentFrequency}</span>
            <div className="mb-1">{getTrendIcon('up')}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lead Time</span>
            <Clock className="w-4 h-4 text-indigo-500 opacity-80" />
        </div>
        <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white">{metrics.leadTimeForChanges}</span>
            <div className="mb-1">{getTrendIcon('stable')}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fail Rate</span>
            <AlertTriangle className="w-4 h-4 text-red-500 opacity-80" />
        </div>
        <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white">{metrics.changeFailureRate}</span>
            <div className="mb-1">{getTrendIcon(metrics.trend)}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recovery Time</span>
            <Activity className="w-4 h-4 text-emerald-500 opacity-80" />
        </div>
        <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white">{metrics.timeToRestoreService}</span>
             <div className="mb-1">{getTrendIcon('stable')}</div>
        </div>
      </div>
    </div>
  );
};
