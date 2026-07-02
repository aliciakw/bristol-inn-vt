export type DeploymentState = 'success' | 'failure' | 'cancelled' | 'active' | 'unknown';

export type DeploymentSummary = {
  id: string;
  state: DeploymentState;
  status: string;
  environment?: 'preview' | 'production';
  url?: string;
  createdAt?: string;
  modifiedAt?: string;
  branch?: string;
  commitHash?: string;
  commitMessage?: string;
  failureMessage?: string;
};

type CloudflarePagesDeployment = {
  id: string;
  environment?: 'preview' | 'production';
  url?: string;
  created_on?: string;
  modified_on?: string;
  latest_stage?: {
    name?: string;
    status?: string;
    ended_on?: string | null;
  };
  deployment_trigger?: {
    metadata?: {
      branch?: string;
      commit_hash?: string;
      commit_message?: string;
    };
  };
};

type CloudflareResponse<T> = {
  success: boolean;
  errors?: Array<{ message?: string }>;
  result: T;
};

type CloudflarePagesConfig = {
  accountId: string;
  projectName: string;
  apiToken: string;
};

const TERMINAL_STATUSES = new Set(['success', 'failure', 'failed', 'canceled', 'cancelled', 'skipped']);

function toApiError(response: Response, body: CloudflareResponse<unknown> | null): Error {
  const message = body?.errors
    ?.map((error) => error.message)
    .filter(Boolean)
    .join('; ');
  return new Error(message || `Cloudflare Pages API request failed with status ${response.status}`);
}

function normalizeState(status: string | undefined): DeploymentState {
  const normalized = status?.toLowerCase() ?? 'unknown';

  if (normalized === 'success') {
    return 'success';
  }

  if (normalized === 'failure' || normalized === 'failed') {
    return 'failure';
  }

  if (normalized === 'canceled' || normalized === 'cancelled') {
    return 'cancelled';
  }

  if (!TERMINAL_STATUSES.has(normalized)) {
    return 'active';
  }

  return 'unknown';
}

function summarizeDeployment(deployment: CloudflarePagesDeployment): DeploymentSummary {
  const status = deployment.latest_stage?.status ?? 'unknown';
  const metadata = deployment.deployment_trigger?.metadata;

  return {
    id: deployment.id,
    state: normalizeState(status),
    status,
    environment: deployment.environment,
    url: deployment.url,
    createdAt: deployment.created_on,
    modifiedAt: deployment.modified_on,
    branch: metadata?.branch,
    commitHash: metadata?.commit_hash,
    commitMessage: metadata?.commit_message,
  };
}

function cloudflarePagesUrl(config: CloudflarePagesConfig, path = ''): string {
  const accountId = encodeURIComponent(config.accountId);
  const projectName = encodeURIComponent(config.projectName);

  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}${path}`;
}

async function cloudflareRequest<T>(config: CloudflarePagesConfig, path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${config.apiToken}`);

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(cloudflarePagesUrl(config, path), {
    ...init,
    headers,
  });

  const body = (await response.json().catch(() => null)) as CloudflareResponse<T> | null;

  if (!response.ok || !body?.success) {
    throw toApiError(response, body);
  }

  return body.result;
}

export async function listPagesDeployments(config: CloudflarePagesConfig): Promise<DeploymentSummary[]> {
  const params = new URLSearchParams({
    env: 'production',
    per_page: '5',
  });
  const deployments = await cloudflareRequest<CloudflarePagesDeployment[]>(config, `/deployments?${params}`);

  return deployments.map(summarizeDeployment);
}

export function findActiveDeployment(deployments: DeploymentSummary[]): DeploymentSummary | undefined {
  return deployments.find((deployment) => deployment.state === 'active');
}

export async function createProductionDeployment(config: CloudflarePagesConfig): Promise<DeploymentSummary> {
  const formData = new FormData();
  formData.set('commit_dirty', 'false');

  const deployment = await cloudflareRequest<CloudflarePagesDeployment>(config, '/deployments', {
    body: formData,
    method: 'POST',
  });

  return summarizeDeployment(deployment);
}

export async function getFailureMessage(config: CloudflarePagesConfig, deploymentId: string): Promise<string | undefined> {
  const logs = await fetch(cloudflarePagesUrl(config, `/deployments/${encodeURIComponent(deploymentId)}/history/logs`), {
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
    },
  });

  if (!logs.ok) {
    return undefined;
  }

  const text = await logs.text();
  const failedLine = text
    .split('\n')
    .reverse()
    .find((line) => /error|failed|exception/i.test(line));

  return failedLine?.trim().slice(0, 500);
}
