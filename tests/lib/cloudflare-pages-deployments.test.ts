import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProductionDeployment, findActiveDeployment, listPagesDeployments } from '../../src/lib/cloudflare/pages-deployments';

const config = {
  accountId: 'account-id',
  apiToken: 'api-token',
  projectName: 'pages-project',
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

describe('listPagesDeployments()', () => {
  it('requests production deployments only', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        success: true,
        result: [],
      }),
    );

    await listPagesDeployments(config);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/deployments?');
    expect(new URL(url).searchParams.get('env')).toBe('production');
    expect(new URL(url).searchParams.get('per_page')).toBe('5');
  });

  it('only reports active deployments from the provided deployment set', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        success: true,
        result: [
          {
            id: 'production-active',
            environment: 'production',
            latest_stage: { status: 'active' },
          },
        ],
      }),
    );

    const deployments = await listPagesDeployments(config);

    expect(findActiveDeployment(deployments)?.id).toBe('production-active');
  });
});

describe('createProductionDeployment()', () => {
  it('creates a deployment without retrying a prior deployment id', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        success: true,
        result: {
          id: 'new-production-deployment',
          environment: 'production',
          latest_stage: { status: 'active' },
        },
      }),
    );

    const deployment = await createProductionDeployment(config);

    expect(deployment.id).toBe('new-production-deployment');
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url.endsWith('/deployments')).toBe(true);
    expect(url).not.toContain('/retry');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('commit_dirty')).toBe('false');
  });
});
