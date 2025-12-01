export enum StatusEnum {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  DONE = 'done',
  VERIFIED = 'verified',
}

export enum AgentType {
  VSCODE = 'vscode',
  CURSOR = 'cursor',
  GITHUB = 'github',
  CI = 'ci',
  ANTIGRAVITY = 'antigravity',
}

export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  defaultBranch: string;
}

export interface Environment {
  id: string;
  name: 'local' | 'dev' | 'staging' | 'prod';
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  required: boolean;
}

export type EvidenceType = 'pr' | 'pipeline' | 'file' | 'console_log' | 'screenshot' | 'artifact' | 'ai_chat';

export interface Evidence {
  id: string;
  type: EvidenceType;
  url: string;
  label: string;
  createdAt: string;
  verifiedBy?: string;
}

export interface ProjectStatus {
  id: string;
  projectId: string;
  envId: string;
  subcategoryId: string;
  status: StatusEnum;
  lastUpdatedBy: string; // 'system_agent' or user_id
  lastUpdatedAt: string;
  confidenceScore: number; // 0-100
  aiExplanation?: string; // Reason for the automated status
  evidence: Evidence[];
}

export interface Agent {
  id: string;
  type: AgentType;
  lastSeen: string;
  status: 'online' | 'offline';
  config: Record<string, any>;
}

export interface AgentEvent {
  id: string;
  agentId: string;
  type: 'file_saved' | 'local_command' | 'ci_pipeline' | 'ai_action' | 'pr_merged' | 'deployment';
  payload: any;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: string;
  type: 'update' | 'alert' | 'agent' | 'ai';
  confidence?: number;
}