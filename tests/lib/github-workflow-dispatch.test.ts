import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dispatchDeployWorkflow, findActiveWorkflowRun, listDeployWorkflowRuns } from '../../src/lib/github/workflow-dispatch';

const config = {
  owner: 'aliciakw',
  repo: 'bristol-inn-vt',
  workflowId: 'deploy-site.yml',
  ref: 'main',
  token: 'github-token',
};

const fetchMock = vi.fn();
const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('listDeployWorkflowRuns()', () => {
  it('requests recent runs for the configured deploy workflow and branch', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        workflow_runs: [],
      }),
    );

    await listDeployWorkflowRuns(config);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/actions/workflows/deploy-site.yml/runs?');
    expect(new URL(url).searchParams.get('branch')).toBe('main');
    expect(new URL(url).searchParams.get('per_page')).toBe('10');
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer github-token');
  });

  it('maps active and completed workflow runs for Studio display', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        workflow_runs: [
          {
            id: 123,
            status: 'in_progress',
            conclusion: null,
            html_url: 'https://github.com/aliciakw/bristol-inn-vt/actions/runs/123',
            head_branch: 'main',
            head_sha: 'abc123',
            display_title: 'Deploy Site',
          },
          {
            id: 122,
            status: 'completed',
            conclusion: 'success',
          },
        ],
      }),
    );

    const runs = await listDeployWorkflowRuns(config);

    expect(runs[0]).toMatchObject({
      id: '123',
      state: 'active',
      status: 'in_progress',
      url: 'https://github.com/aliciakw/bristol-inn-vt/actions/runs/123',
      branch: 'main',
      commitHash: 'abc123',
      commitMessage: 'Deploy Site',
    });
    expect(runs[1]).toMatchObject({
      id: '122',
      state: 'success',
      status: 'success',
    });
    expect(findActiveWorkflowRun(runs)?.id).toBe('123');
  });
});

describe('dispatchDeployWorkflow()', () => {
  it('dispatches the configured workflow ref', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const run = await dispatchDeployWorkflow(config);

    expect(run).toMatchObject({
      state: 'active',
      status: 'queued',
      branch: 'main',
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url.endsWith('/actions/workflows/deploy-site.yml/dispatches')).toBe(true);
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ ref: 'main' });
  });
});
