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

export interface Evidence {
  id: string;
  type: 'pr' | 'pipeline' | 'file' | 'console_log';
  url: string;
  label: string;
  createdAt: string;
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
  evidence: Evidence[];
}

export interface Agent {
  id: string;
  type: AgentType;
  lastSeen: string;
  status: 'online' | 'offline';
  config: Record<string, any>;
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: string;
  type: 'update' | 'alert' | 'agent';
}
