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
  { id: 'a3', type: AgentType.CURSOR, lastSeen: new Date(Date.now() - 120000).toISOString(), status: 'online', config: {} },
  { id: 'a4', type: AgentType.ANTIGRAVITY, lastSeen: new Date().toISOString(), status: 'online', config: {} },
  { id: 'a5', type: AgentType.CI, lastSeen: new Date().toISOString(), status: 'online', config: {} },
];

// Enhanced "Colorful but Calm" Visuals using Tailwind Gradients
export const STATUS_STYLES = {
  [StatusEnum.NOT_STARTED]: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 shadow-sm',
  [StatusEnum.IN_PROGRESS]: 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 text-indigo-700 hover:shadow-md hover:border-indigo-300',
  [StatusEnum.BLOCKED]: 'bg-gradient-to-br from-orange-50 to-red-50 border-red-200 text-red-700 hover:shadow-md hover:border-red-300',
  [StatusEnum.DONE]: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:shadow-md hover:border-emerald-300',
  [StatusEnum.VERIFIED]: 'bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-200 text-violet-700 ring-1 ring-violet-200 hover:shadow-md',
};

export const STATUS_LABELS = {
  [StatusEnum.NOT_STARTED]: 'Not Started',
  [StatusEnum.IN_PROGRESS]: 'In Progress',
  [StatusEnum.BLOCKED]: 'Blocked',
  [StatusEnum.DONE]: 'Done',
  [StatusEnum.VERIFIED]: 'Verified',
};

// Initial Mock Statuses - Generated for ALL environments
export const INITIAL_STATUSES: ProjectStatus[] = [];

ENVIRONMENTS.forEach(env => {
    SUBCATEGORIES.forEach(sub => {
        INITIAL_STATUSES.push({
            id: `ps-${env.id}-${sub.id}`,
            projectId: 'p1',
            envId: env.id,
            subcategoryId: sub.id,
            status: StatusEnum.NOT_STARTED,
            lastUpdatedBy: 'system',
            lastUpdatedAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
            confidenceScore: 0,
            evidence: [],
        });
    });
});