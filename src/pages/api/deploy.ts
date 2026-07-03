import type { APIContext } from 'astro';
import { GitHubActionsApiError, dispatchDeployWorkflow, findActiveWorkflowRun, listDeployWorkflowRuns, type WorkflowRunSummary } from '../../lib/github/workflow-dispatch';
import {
  // DEPLOY_ALLOWED_ORIGINS,
  DEPLOY_TRIGGER_TOKEN,
  // GITHUB_DEPLOY_OWNER,
  // GITHUB_DEPLOY_REF,
  // GITHUB_DEPLOY_REPO,
  GITHUB_DEPLOY_TOKEN,
  // GITHUB_DEPLOY_WORKFLOW_ID,
} from 'astro:env/server';

export const prerender = false;

type DeployResponse = {
  message: string;
  activeDeployment?: WorkflowRunSummary;
  latestDeployment?: WorkflowRunSummary;
  triggeredDeployment?: WorkflowRunSummary;
};

let inFlightWorkflowDispatch: Promise<WorkflowRunSummary> | undefined;
let lastWorkflowDispatch: { deployment: WorkflowRunSummary; expiresAt: number } | undefined;

const DISPATCH_COOLDOWN_MS = 30_000;
// Temporary override while debugging GitHub Actions token permissions.
const DEPLOY_WORKFLOW_OWNER = 'aliciakw';
const DEPLOY_WORKFLOW_REPO = 'bristol-inn-vt';
const DEPLOY_WORKFLOW_ID = 'deploy-site.yml';
const DEPLOY_REF = 'main';

// function normalizeOrigin(origin: string): string | undefined {
//   const trimmedOrigin = origin.trim();

//   if (!trimmedOrigin) {
//     return undefined;
//   }

//   try {
//     return new URL(trimmedOrigin).origin;
//   } catch {
//     return trimmedOrigin.replace(/\/+$/, '');
//   }
// }

// const allowedOrigins = new Set(
//   DEPLOY_ALLOWED_ORIGINS.split(',')
//     .map(normalizeOrigin)
//     .filter((origin): origin is string => Boolean(origin)),
// );

function corsHeaders(origin: string | null): HeadersInit {
  // Temporary permissive CORS while debugging Studio deploy configuration.
  return {
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': origin ?? '*',
    Vary: 'Origin',
  };
}

function jsonResponse(body: DeployResponse | { error: string }, status: number, origin: string | null): Response {
  return Response.json(body, {
    status,
    headers: corsHeaders(origin),
  });
}

function requestId(request: Request): string {
  return request.headers.get('cf-ray') ?? crypto.randomUUID();
}

function logDeployRouteError(method: 'GET' | 'POST', id: string, error: unknown): void {
  if (error instanceof GitHubActionsApiError) {
    console.error(
      JSON.stringify({
        errorMessage: error.message,
        method,
        path: error.path,
        requestId: id,
        responseBody: error.responseBody?.slice(0, 1_000),
        route: '/api/deploy',
        source: 'deploy-route',
        status: error.status,
      }),
    );
    return;
  }

  console.error(
    JSON.stringify({
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'UnknownError',
      method,
      requestId: id,
      route: '/api/deploy',
      source: 'deploy-route',
    }),
  );
}

function getConfig() {
  if (!GITHUB_DEPLOY_TOKEN) {
    throw new Error('GitHub deploy workflow API is not configured.');
  }

  return {
    // owner: GITHUB_DEPLOY_OWNER,
    // repo: GITHUB_DEPLOY_REPO,
    // workflowId: GITHUB_DEPLOY_WORKFLOW_ID,
    owner: DEPLOY_WORKFLOW_OWNER,
    repo: DEPLOY_WORKFLOW_REPO,
    workflowId: DEPLOY_WORKFLOW_ID,
    ref: DEPLOY_REF,
    token: GITHUB_DEPLOY_TOKEN,
  };
}

function assertCanTrigger(request: Request): boolean {
  if (!DEPLOY_TRIGGER_TOKEN) {
    return false;
  }

  return request.headers.get('Authorization') === `Bearer ${DEPLOY_TRIGGER_TOKEN}`;
}

async function dispatchDeployWorkflowOnce(): Promise<WorkflowRunSummary> {
  if (lastWorkflowDispatch && lastWorkflowDispatch.expiresAt > Date.now()) {
    return lastWorkflowDispatch.deployment;
  }

  if (!inFlightWorkflowDispatch) {
    inFlightWorkflowDispatch = dispatchDeployWorkflow(getConfig())
      .then((deployment) => {
        lastWorkflowDispatch = {
          deployment,
          expiresAt: Date.now() + DISPATCH_COOLDOWN_MS,
        };
        return deployment;
      })
      .finally(() => {
        inFlightWorkflowDispatch = undefined;
      });
  }

  return inFlightWorkflowDispatch;
}

async function getDeployStatus(): Promise<DeployResponse> {
  const runs = await listDeployWorkflowRuns(getConfig());
  const activeDeployment = findActiveWorkflowRun(runs);
  const latestDeployment = runs[0];

  if (activeDeployment) {
    return {
      message: `A deploy workflow is already ${activeDeployment.status}.`,
      activeDeployment,
      latestDeployment,
    };
  }

  return {
    message: latestDeployment ? `Latest deploy workflow run is ${latestDeployment.status}.` : 'No deploy workflow runs were found.',
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
  const id = requestId(request);

  try {
    return jsonResponse(await getDeployStatus(), 200, origin);
  } catch (error) {
    logDeployRouteError('GET', id, error);
    return jsonResponse(
      {
        error: error instanceof Error ? `${error.message} Request id: ${id}` : `Unable to fetch deployment status. Request id: ${id}`,
      },
      500,
      origin,
    );
  }
}

export async function POST({ request }: APIContext): Promise<Response> {
  const origin = request.headers.get('Origin');
  const id = requestId(request);

  if (!assertCanTrigger(request)) {
    return jsonResponse({ error: 'Deploy trigger token is missing or invalid.' }, 401, origin);
  }

  try {
    const status = await getDeployStatus();

    if (status.activeDeployment) {
      return jsonResponse(status, 200, origin);
    }

    const triggeredDeployment = await dispatchDeployWorkflowOnce();

    return jsonResponse(
      {
        message: `Triggered deploy workflow ${triggeredDeployment.id}. Give GitHub a few seconds to list the new run before triggering again.`,
        latestDeployment: triggeredDeployment,
        triggeredDeployment,
      },
      202,
      origin,
    );
  } catch (error) {
    logDeployRouteError('POST', id, error);
    return jsonResponse(
      {
        error: error instanceof Error ? `${error.message} Request id: ${id}` : `Unable to trigger deployment. Request id: ${id}`,
      },
      500,
      origin,
    );
  }
}
