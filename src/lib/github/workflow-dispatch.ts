export type WorkflowState = 'success' | 'failure' | 'cancelled' | 'active' | 'unknown';

export type WorkflowRunSummary = {
  id: string;
  state: WorkflowState;
  status: string;
  url?: string;
  createdAt?: string;
  modifiedAt?: string;
  branch?: string;
  commitHash?: string;
  commitMessage?: string;
  failureMessage?: string;
};

type GitHubWorkflowRun = {
  id: number;
  name?: string;
  display_title?: string;
  status?: string;
  conclusion?: string | null;
  html_url?: string;
  created_at?: string;
  updated_at?: string;
  head_branch?: string;
  head_sha?: string;
};

type GitHubWorkflowRunsResponse = {
  workflow_runs: GitHubWorkflowRun[];
};

type GitHubWorkflowConfig = {
  owner: string;
  repo: string;
  workflowId: string;
  ref: string;
  token: string;
};

export class GitHubActionsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
    readonly responseBody?: string,
  ) {
    super(message);
    this.name = 'GitHubActionsApiError';
  }
}

function githubUrl(config: GitHubWorkflowConfig, path: string): string {
  return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}${path}`;
}

async function githubRequest<T>(config: GitHubWorkflowConfig, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(githubUrl(config, path), {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'bristol-inn-vt-deploy-tool',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '');
    let message: string | undefined;

    try {
      message = (JSON.parse(responseBody) as { message?: string }).message;
    } catch {
      message = undefined;
    }

    throw new GitHubActionsApiError(message || `GitHub Actions API request failed with status ${response.status}`, response.status, path, responseBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function normalizeState(status: string | undefined, conclusion: string | null | undefined): WorkflowState {
  if (status && status !== 'completed') {
    return 'active';
  }

  if (conclusion === 'success') {
    return 'success';
  }

  if (conclusion === 'failure' || conclusion === 'timed_out' || conclusion === 'action_required') {
    return 'failure';
  }

  if (conclusion === 'cancelled') {
    return 'cancelled';
  }

  return 'unknown';
}

function summarizeRun(run: GitHubWorkflowRun): WorkflowRunSummary {
  return {
    id: String(run.id),
    state: normalizeState(run.status, run.conclusion),
    status: run.conclusion ?? run.status ?? 'unknown',
    url: run.html_url,
    createdAt: run.created_at,
    modifiedAt: run.updated_at,
    branch: run.head_branch,
    commitHash: run.head_sha,
    commitMessage: run.display_title ?? run.name,
  };
}

export async function listDeployWorkflowRuns(config: GitHubWorkflowConfig): Promise<WorkflowRunSummary[]> {
  const params = new URLSearchParams({
    branch: config.ref,
    per_page: '10',
  });
  const body = await githubRequest<GitHubWorkflowRunsResponse>(config, `/actions/workflows/${encodeURIComponent(config.workflowId)}/runs?${params}`);

  return body.workflow_runs.map(summarizeRun);
}

export function findActiveWorkflowRun(runs: WorkflowRunSummary[]): WorkflowRunSummary | undefined {
  return runs.find((run) => run.state === 'active');
}

export async function dispatchDeployWorkflow(config: GitHubWorkflowConfig): Promise<WorkflowRunSummary> {
  await githubRequest(config, `/actions/workflows/${encodeURIComponent(config.workflowId)}/dispatches`, {
    body: JSON.stringify({
      ref: config.ref,
    }),
    method: 'POST',
  });

  return {
    id: `${config.workflowId}:${Date.now()}`,
    state: 'active',
    status: 'queued',
    branch: config.ref,
    commitMessage: `Dispatched ${config.workflowId}`,
  };
}
