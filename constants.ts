import { Category, Subcategory, Project, Environment, StatusEnum, AgentType, Agent, ProjectStatus } from './types';

export const CATEGORIES: Category[] = [
  { id: 'c1', slug: 'infra', title: 'Infrastructure', description: 'Containerization, IaC, and Networking', order: 1 },
  { id: 'c2', slug: 'cicd', title: 'CI/CD', description: 'Pipelines, Automation, and Deployments', order: 2 },
  { id: 'c3', slug: 'tests', title: 'Testing', description: 'Unit, Integration, and E2E coverage', order: 3 },
  { id: 'c4', slug: 'security', title: 'Security', description: 'Auth, scanning, and compliance', order: 4 },
];

export const SUBCATEGORIES: Subcategory[] = [
  { id: 's1', categoryId: 'c1', slug: 'docker', title: 'Docker Basics', required: true },
  { id: 's2', categoryId: 'c1', slug: 'k8s', title: 'Kubernetes Manifests', required: false },
  { id: 's3', categoryId: 'c2', slug: 'build', title: 'Build Pipeline', required: true },
  { id: 's4', categoryId: 'c2', slug: 'lint', title: 'Linting & Formatting', required: true },
  { id: 's5', categoryId: 'c3', slug: 'unit', title: 'Unit Tests', required: true },
  { id: 's6', categoryId: 'c3', slug: 'e2e', title: 'E2E Tests', required: false },
  { id: 's7', categoryId: 'c4', slug: 'sast', title: 'Static Analysis', required: true },
  { id: 's8', categoryId: 'c4', slug: 'deps', title: 'Dependency Scanning', required: true },
];

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'DevStatus Core', repoUrl: 'github.com/org/devstatus', defaultBranch: 'main' },
  { id: 'p2', name: 'Analytics Service', repoUrl: 'github.com/org/analytics', defaultBranch: 'develop' },
];

export const ENVIRONMENTS: Environment[] = [
  { id: 'e1', name: 'dev' },
  { id: 'e2', name: 'staging' },
  { id: 'e3', name: 'prod' },
];

export const MOCK_AGENTS: Agent[] = [
  { id: 'a1', type: AgentType.VSCODE, lastSeen: new Date().toISOString(), status: 'online', config: {} },
  { id: 'a2', type: AgentType.GITHUB, lastSeen: new Date(Date.now() - 3600000).toISOString(), status: 'online', config: {} },
  { id: 'a3', type: AgentType.CURSOR, lastSeen: new Date(Date.now() - 86400000).toISOString(), status: 'offline', config: {} },
];

export const STATUS_COLORS = {
  [StatusEnum.NOT_STARTED]: 'bg-slate-100 text-slate-500 border-slate-200',
  [StatusEnum.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
  [StatusEnum.BLOCKED]: 'bg-red-50 text-red-700 border-red-200',
  [StatusEnum.DONE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [StatusEnum.VERIFIED]: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-300',
};

export const STATUS_LABELS = {
  [StatusEnum.NOT_STARTED]: 'Not Started',
  [StatusEnum.IN_PROGRESS]: 'In Progress',
  [StatusEnum.BLOCKED]: 'Blocked',
  [StatusEnum.DONE]: 'Done',
  [StatusEnum.VERIFIED]: 'Verified',
};

// Initial Mock Statuses
export const INITIAL_STATUSES: ProjectStatus[] = SUBCATEGORIES.map((sub) => ({
  id: `ps-${sub.id}`,
  projectId: 'p1',
  envId: 'e1',
  subcategoryId: sub.id,
  status: Math.random() > 0.7 ? StatusEnum.DONE : StatusEnum.NOT_STARTED,
  lastUpdatedBy: 'system_agent',
  lastUpdatedAt: new Date().toISOString(),
  confidenceScore: 85,
  evidence: [],
}));
