import type { APIContext } from 'astro';
import { findActiveDeployment, getFailureMessage, listPagesDeployments, retryPagesDeployment, type DeploymentSummary } from '../../lib/cloudflare/pages-deployments';
import { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_PAGES_PROJECT_NAME, DEPLOY_ALLOWED_ORIGINS, DEPLOY_TRIGGER_TOKEN } from 'astro:env/server';

export const prerender = false;

type DeployResponse = {
  message: string;
  activeDeployment?: DeploymentSummary;
  latestDeployment?: DeploymentSummary;
  triggeredDeployment?: DeploymentSummary;
};

const allowedOrigins = DEPLOY_ALLOWED_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null): HeadersInit {
  if (!origin || !allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  };
}

function jsonResponse(body: DeployResponse | { error: string }, status: number, origin: string | null): Response {
  return Response.json(body, {
    status,
    headers: corsHeaders(origin),
  });
}

function getConfig() {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_PAGES_PROJECT_NAME || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Cloudflare deploy API is not configured.');
  }

  return {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    projectName: CLOUDFLARE_PAGES_PROJECT_NAME,
    apiToken: CLOUDFLARE_API_TOKEN,
  };
}

function assertCanTrigger(request: Request): boolean {
  if (!DEPLOY_TRIGGER_TOKEN) {
    return false;
  }

  return request.headers.get('Authorization') === `Bearer ${DEPLOY_TRIGGER_TOKEN}`;
}

async function getDeployStatus(includeFailureMessage: boolean): Promise<DeployResponse> {
  const config = getConfig();
  const deployments = await listPagesDeployments(config);
  const activeDeployment = findActiveDeployment(deployments);
  const latestDeployment = deployments[0];

  if (includeFailureMessage && latestDeployment?.state === 'failure') {
    latestDeployment.failureMessage = await getFailureMessage(config, latestDeployment.id).catch(() => undefined);
  }

  if (activeDeployment) {
    return {
      message: `A Cloudflare Pages deployment is already ${activeDeployment.status}.`,
      activeDeployment,
      latestDeployment,
    };
  }

  return {
    message: latestDeployment ? `Latest Cloudflare Pages deployment is ${latestDeployment.status}.` : 'No Cloudflare Pages deployments were found.',
    latestDeployment,
  };
}

export function OPTIONS({ request }: APIContext): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('Origin')),
  });
}

export async function GET({ request }: APIContext): Promise<Response> {
  const origin = request.headers.get('Origin');

  try {
    return jsonResponse(await getDeployStatus(true), 200, origin);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unable to fetch deployment status.' }, 500, origin);
  }
}

export async function POST({ request }: APIContext): Promise<Response> {
  const origin = request.headers.get('Origin');

  if (!assertCanTrigger(request)) {
    return jsonResponse({ error: 'Deploy trigger token is missing or invalid.' }, 401, origin);
  }

  try {
    const status = await getDeployStatus(false);

    if (status.activeDeployment) {
      return jsonResponse(status, 200, origin);
    }

    if (!status.latestDeployment) {
      return jsonResponse({ error: 'No previous deployment is available to retry.' }, 409, origin);
    }

    const triggeredDeployment = await retryPagesDeployment(getConfig(), status.latestDeployment.id);

    return jsonResponse(
      {
        message: `Triggered Cloudflare Pages deployment ${triggeredDeployment.id}.`,
        latestDeployment: status.latestDeployment,
        triggeredDeployment,
      },
      202,
      origin,
    );
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unable to trigger deployment.' }, 500, origin);
  }
}
