import { Category, Subcategory, Project, Environment, StatusEnum, AgentType, Agent, ProjectStatus } from './types';

// Categories mapped to specific stages based on the prompt
export const CATEGORIES: Category[] = [
  // --- LOCAL / DEV ---
  { 
    id: 'c_dev_infra', slug: 'dev-infra', title: 'Architecture & Infrastructure (Dev)', 
    description: 'Local env, Database, Caching, Docker', order: 1, 
    stages: ['dev'] 
  },
  { 
    id: 'c_dev_workflow', slug: 'dev-workflow', title: 'Development Workflow', 
    description: 'Git, Code Review, Testing, TDD', order: 2, 
    stages: ['dev'] 
  },
  { 
    id: 'c_dev_advanced', slug: 'dev-advanced', title: 'Advanced Practices', 
    description: 'Security (local), Auth, Clean Code', order: 3, 
    stages: ['dev'] 
  },
  
  // --- STAGING ---
  { 
    id: 'c_stg_cicd', slug: 'stg-cicd', title: 'CI/CD & Deployment', 
    description: 'Pipelines, Automation, Deploy to Staging', order: 1, 
    stages: ['staging'] 
  },
  { 
    id: 'c_stg_iac', slug: 'stg-iac', title: 'Infrastructure as Code', 
    description: 'Terraform, K8s, Drift Detection', order: 2, 
    stages: ['staging'] 
  },
  { 
    id: 'c_stg_ops', slug: 'stg-ops', title: 'Advanced DevOps', 
    description: 'Orchestration, Load Testing, Chaos', order: 3, 
    stages: ['staging'] 
  },
  
  // --- PRODUCTION ---
  { 
    id: 'c_prod_infra', slug: 'prod-infra', title: 'Infrastructure (Live)', 
    description: 'Cloud, CDN, Sharding, Replication', order: 1, 
    stages: ['prod'] 
  },
  { 
    id: 'c_prod_cicd', slug: 'prod-cicd', title: 'Deployment & Release', 
    description: 'Zero-downtime, Blue-Green, GitOps', order: 2, 
    stages: ['prod'] 
  },
  { 
    id: 'c_prod_monitor', slug: 'prod-monitor', title: 'Monitoring & Maintenance', 
    description: 'APM, Alerting, SLOs, Incident Response', order: 3, 
    stages: ['prod'] 
  },
  { 
    id: 'c_prod_biz', slug: 'prod-biz', title: 'Business & Product', 
    description: 'Analytics, A/B Testing, User Feedback', order: 4, 
    stages: ['prod'] 
  }
];

export const SUBCATEGORIES: Subcategory[] = [
  // DEV: Architecture & Infra
  { id: 's_dev_febe', categoryId: 'c_dev_infra', slug: 'fe-be-sep', title: 'Frontend/Backend Separation', required: true, stages: ['dev'] },
  { id: 's_dev_db', categoryId: 'c_dev_infra', slug: 'db-local', title: 'Database (Local Postgres/Supabase)', required: true, stages: ['dev'] },
  { id: 's_dev_docker', categoryId: 'c_dev_infra', slug: 'docker-basics', title: 'Docker Basics & DevContainers', required: true, stages: ['dev'] },
  { id: 's_dev_env', categoryId: 'c_dev_infra', slug: 'env-vars', title: 'Env Vars & Secrets (.env)', required: true, stages: ['dev'] },

  // DEV: Workflow
  { id: 's_dev_git', categoryId: 'c_dev_workflow', slug: 'git-flow', title: 'Version Control (Branching)', required: true, stages: ['dev'] },
  { id: 's_dev_unit', categoryId: 'c_dev_workflow', slug: 'unit-tests', title: 'Unit Tests (Local)', required: true, stages: ['dev'] },
  { id: 's_dev_mig', categoryId: 'c_dev_workflow', slug: 'db-mig', title: 'DB Migrations (Local)', required: true, stages: ['dev'] },
  { id: 's_dev_cov', categoryId: 'c_dev_workflow', slug: 'test-cov', title: 'Test Coverage Analysis', required: false, stages: ['dev'] },

  // DEV: Advanced
  { id: 's_dev_owasp', categoryId: 'c_dev_advanced', slug: 'owasp', title: 'OWASP Top 10 Scanning', required: true, stages: ['dev'] },
  { id: 's_dev_auth', categoryId: 'c_dev_advanced', slug: 'auth-local', title: 'Auth Implementation (JWT/OAuth)', required: true, stages: ['dev'] },

  // STAGING: CI/CD
  { id: 's_stg_pipe', categoryId: 'c_stg_cicd', slug: 'gh-actions', title: 'Full CI Pipeline (GitHub Actions)', required: true, stages: ['staging'] },
  { id: 's_stg_auto', categoryId: 'c_stg_cicd', slug: 'auto-test-ci', title: 'Automated Testing in CI', required: true, stages: ['staging'] },
  { id: 's_stg_bg', categoryId: 'c_stg_cicd', slug: 'blue-green-stg', title: 'Blue-Green Deployment Test', required: false, stages: ['staging'] },
  
  // STAGING: IaC
  { id: 's_stg_tf', categoryId: 'c_stg_iac', slug: 'terraform', title: 'Terraform/Pulumi Apply', required: true, stages: ['staging'] },
  { id: 's_stg_k8s', categoryId: 'c_stg_iac', slug: 'k8s-stg', title: 'Kubernetes Cluster (Staging)', required: true, stages: ['staging'] },

  // STAGING: Ops
  { id: 's_stg_load', categoryId: 'c_stg_ops', slug: 'load-test', title: 'Load Testing (k6/JMeter)', required: true, stages: ['staging'] },
  { id: 's_stg_pen', categoryId: 'c_stg_ops', slug: 'pentest', title: 'Security Penetration Test', required: true, stages: ['staging'] },

  // PROD: Infra
  { id: 's_prod_cloud', categoryId: 'c_prod_infra', slug: 'aws-prod', title: 'Cloud Hosting (AWS/GCP)', required: true, stages: ['prod'] },
  { id: 's_prod_cdn', categoryId: 'c_prod_infra', slug: 'cdn', title: 'CDN (CloudFront)', required: true, stages: ['prod'] },
  { id: 's_prod_db', categoryId: 'c_prod_infra', slug: 'db-scale', title: 'DB Sharding & Replication', required: true, stages: ['prod'] },

  // PROD: Release
  { id: 's_prod_zero', categoryId: 'c_prod_cicd', slug: 'zero-down', title: 'Zero-downtime Deployment', required: true, stages: ['prod'] },
  { id: 's_prod_flags', categoryId: 'c_prod_cicd', slug: 'feat-flags', title: 'Feature Flags (Live)', required: true, stages: ['prod'] },

  // PROD: Monitor
  { id: 's_prod_logs', categoryId: 'c_prod_monitor', slug: 'logs-live', title: 'Log Aggregation (ELK)', required: true, stages: ['prod'] },
  { id: 's_prod_apm', categoryId: 'c_prod_monitor', slug: 'apm', title: 'APM (Datadog/New Relic)', required: true, stages: ['prod'] },
  { id: 's_prod_alert', categoryId: 'c_prod_monitor', slug: 'pagerduty', title: 'Alerting & On-call', required: true, stages: ['prod'] },

  // PROD: Business
  { id: 's_prod_analytics', categoryId: 'c_prod_biz', slug: 'mixpanel', title: 'User Analytics (Mixpanel)', required: true, stages: ['prod'] },
];

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'DevStatus Core', repoUrl: 'github.com/org/devstatus', defaultBranch: 'main' },
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

// Initial Mock Statuses - Generated ONLY if the subcategory belongs to the environment
export const INITIAL_STATUSES: ProjectStatus[] = [];

ENVIRONMENTS.forEach(env => {
    SUBCATEGORIES.forEach(sub => {
        // Strict Check: Only create a status if this subcategory belongs to this environment
        if (sub.stages.includes(env.name)) {
            // Randomize initial status for variety
            let initStatus = StatusEnum.NOT_STARTED;
            if (env.name === 'dev' && Math.random() > 0.6) initStatus = StatusEnum.IN_PROGRESS;
            if (env.name === 'staging' && Math.random() > 0.5) initStatus = StatusEnum.DONE;
            if (env.name === 'prod' && Math.random() > 0.8) initStatus = StatusEnum.VERIFIED;

            INITIAL_STATUSES.push({
                id: `ps-${env.id}-${sub.id}`,
                projectId: 'p1',
                envId: env.id,
                subcategoryId: sub.id,
                status: initStatus,
                lastUpdatedBy: 'system',
                lastUpdatedAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
                confidenceScore: initStatus === StatusEnum.DONE ? Math.floor(Math.random() * 20) + 80 : 0,
                evidence: [],
            });
        }
    });
});