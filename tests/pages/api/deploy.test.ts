import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const dispatchDeployWorkflow = vi.fn();
const findActiveWorkflowRun = vi.fn();
const listDeployWorkflowRuns = vi.fn();

vi.mock('../../../src/lib/github/workflow-dispatch', () => ({
  GitHubActionsApiError: class GitHubActionsApiError extends Error {},
  dispatchDeployWorkflow,
  findActiveWorkflowRun,
  listDeployWorkflowRuns,
}));

function authorizedRequest(): Request {
  return new Request('https://www.example.com/api/deploy', {
    headers: {
      Authorization: 'Bearer test-deploy-trigger-token',
    },
    method: 'POST',
  });
}

function contextWithRequest(request: Request): APIContext {
  return { request } as APIContext;
}

async function importDeployRoute() {
  return import('../../../src/pages/api/deploy');
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  findActiveWorkflowRun.mockReturnValue(undefined);
  listDeployWorkflowRuns.mockResolvedValue([
    {
      id: 'old-workflow-run',
      state: 'success',
      status: 'success',
    },
  ]);
});

describe('POST /api/deploy', () => {
  it('returns the dispatched workflow as the latest deployment', async () => {
    const triggeredDeployment = {
      id: 'deploy-site.yml:123',
      state: 'active',
      status: 'queued',
    };
    dispatchDeployWorkflow.mockResolvedValue(triggeredDeployment);
    const { POST } = await importDeployRoute();

    const response = await POST(contextWithRequest(authorizedRequest()));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.triggeredDeployment).toEqual(triggeredDeployment);
    expect(body.latestDeployment).toEqual(triggeredDeployment);
  });

  it('does not dispatch a workflow when one is already active', async () => {
    const activeWorkflowRun = {
      id: 'active-workflow-run',
      state: 'active',
      status: 'in_progress',
    };
    findActiveWorkflowRun.mockReturnValue(activeWorkflowRun);
    const { POST } = await importDeployRoute();

    const response = await POST(contextWithRequest(authorizedRequest()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(dispatchDeployWorkflow).not.toHaveBeenCalled();
    expect(body.activeDeployment).toEqual(activeWorkflowRun);
  });

  it('shares one workflow dispatch across overlapping POST requests', async () => {
    let resolveWorkflowRun: (deployment: unknown) => void = () => {};
    dispatchDeployWorkflow.mockReturnValue(
      new Promise((resolve) => {
        resolveWorkflowRun = resolve;
      }),
    );
    const { POST } = await importDeployRoute();

    const firstResponse = POST(contextWithRequest(authorizedRequest()));
    const secondResponse = POST(contextWithRequest(authorizedRequest()));

    resolveWorkflowRun({
      id: 'shared-workflow-dispatch',
      state: 'active',
      status: 'queued',
    });

    const [first, second] = await Promise.all([firstResponse, secondResponse]);

    expect(dispatchDeployWorkflow).toHaveBeenCalledOnce();
    expect(first.status).toBe(202);
    expect(second.status).toBe(202);
    await expect(first.json()).resolves.toMatchObject({
      triggeredDeployment: { id: 'shared-workflow-dispatch' },
    });
    await expect(second.json()).resolves.toMatchObject({
      triggeredDeployment: { id: 'shared-workflow-dispatch' },
    });
  });

  it('reuses a recent workflow dispatch while GitHub is still listing the new run', async () => {
    dispatchDeployWorkflow.mockResolvedValue({
      id: 'recent-workflow-dispatch',
      state: 'active',
      status: 'queued',
    });
    const { POST } = await importDeployRoute();

    const firstResponse = await POST(contextWithRequest(authorizedRequest()));
    const secondResponse = await POST(contextWithRequest(authorizedRequest()));

    expect(dispatchDeployWorkflow).toHaveBeenCalledOnce();
    expect(firstResponse.status).toBe(202);
    expect(secondResponse.status).toBe(202);
    await expect(secondResponse.json()).resolves.toMatchObject({
      triggeredDeployment: { id: 'recent-workflow-dispatch' },
    });
  });
});

describe('CORS /api/deploy', () => {
  it('allows origins when configured values include a trailing slash or path', async () => {
    const { OPTIONS } = await importDeployRoute();

    const localResponse = OPTIONS(
      contextWithRequest(
        new Request('https://www.example.com/api/deploy', {
          headers: {
            Origin: 'http://localhost:3333',
          },
          method: 'OPTIONS',
        }),
      ),
    );
    const studioResponse = OPTIONS(
      contextWithRequest(
        new Request('https://www.example.com/api/deploy', {
          headers: {
            Origin: 'https://studio.example.com',
          },
          method: 'OPTIONS',
        }),
      ),
    );

    expect(localResponse.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3333');
    expect(studioResponse.headers.get('Access-Control-Allow-Origin')).toBe('https://studio.example.com');
  });
});
