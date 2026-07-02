import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIContext } from 'astro';

const createProductionDeployment = vi.fn();
const findActiveDeployment = vi.fn();
const getFailureMessage = vi.fn();
const listPagesDeployments = vi.fn();

vi.mock('../../../src/lib/cloudflare/pages-deployments', () => ({
  createProductionDeployment,
  findActiveDeployment,
  getFailureMessage,
  listPagesDeployments,
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
  findActiveDeployment.mockReturnValue(undefined);
  getFailureMessage.mockResolvedValue(undefined);
  listPagesDeployments.mockResolvedValue([
    {
      id: 'old-production-deployment',
      state: 'success',
      status: 'success',
    },
  ]);
});

describe('POST /api/deploy', () => {
  it('returns the newly created deployment as the latest deployment', async () => {
    const triggeredDeployment = {
      id: 'new-production-deployment',
      state: 'active',
      status: 'active',
    };
    createProductionDeployment.mockResolvedValue(triggeredDeployment);
    const { POST } = await importDeployRoute();

    const response = await POST(contextWithRequest(authorizedRequest()));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.triggeredDeployment).toEqual(triggeredDeployment);
    expect(body.latestDeployment).toEqual(triggeredDeployment);
  });

  it('shares one create request across overlapping POST requests', async () => {
    let resolveDeployment: (deployment: unknown) => void = () => {};
    createProductionDeployment.mockReturnValue(
      new Promise((resolve) => {
        resolveDeployment = resolve;
      }),
    );
    const { POST } = await importDeployRoute();

    const firstResponse = POST(contextWithRequest(authorizedRequest()));
    const secondResponse = POST(contextWithRequest(authorizedRequest()));

    resolveDeployment({
      id: 'shared-production-deployment',
      state: 'active',
      status: 'active',
    });

    const [first, second] = await Promise.all([firstResponse, secondResponse]);

    expect(createProductionDeployment).toHaveBeenCalledOnce();
    expect(first.status).toBe(202);
    expect(second.status).toBe(202);
    await expect(first.json()).resolves.toMatchObject({
      triggeredDeployment: { id: 'shared-production-deployment' },
    });
    await expect(second.json()).resolves.toMatchObject({
      triggeredDeployment: { id: 'shared-production-deployment' },
    });
  });
});
