import {useCallback, useEffect, useState, type CSSProperties} from 'react'

type DeploymentState = 'success' | 'failure' | 'cancelled' | 'active' | 'unknown'

type DeploymentSummary = {
  id: string
  state: DeploymentState
  status: string
  url?: string
  createdAt?: string
  modifiedAt?: string
  branch?: string
  commitHash?: string
  commitMessage?: string
  failureMessage?: string
}

type DeployResponse = {
  message: string
  activeDeployment?: DeploymentSummary
  latestDeployment?: DeploymentSummary
  triggeredDeployment?: DeploymentSummary
  error?: string
}

const DEPLOY_COOLDOWN_SECONDS = 30

// TODO: It would be nice if these were not hard coded, but since they are included in the
// JS bundle, they are not secret.
const deployEndpoint = import.meta.env.SANITY_STUDIO_DEPLOY_API_URL as string | undefined
const deployToken = import.meta.env.SANITY_STUDIO_DEPLOY_TRIGGER_TOKEN as string | undefined

function formatDate(value?: string): string {
  if (!value) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function stateLabel(state: DeploymentState): string {
  if (state === 'cancelled') {
    return 'Cancelled'
  }

  return state.charAt(0).toUpperCase() + state.slice(1)
}

function DeploymentDetails({deployment, title}: {deployment?: DeploymentSummary; title: string}) {
  if (!deployment) {
    return null
  }

  return (
    <section style={styles.panel}>
      <h2 style={styles.heading}>{title}</h2>
      <dl style={styles.details}>
        <dt style={styles.term}>Status</dt>
        <dd style={styles.description}>{stateLabel(deployment.state)}</dd>
        <dt style={styles.term}>Cloudflare stage</dt>
        <dd style={styles.description}>{deployment.status}</dd>
        <dt style={styles.term}>Updated</dt>
        <dd style={styles.description}>
          {formatDate(deployment.modifiedAt ?? deployment.createdAt)}
        </dd>
        {deployment.branch ? (
          <>
            <dt style={styles.term}>Branch</dt>
            <dd style={styles.description}>{deployment.branch}</dd>
          </>
        ) : null}
        {deployment.commitHash ? (
          <>
            <dt style={styles.term}>Commit</dt>
            <dd style={styles.description}>{deployment.commitHash.slice(0, 7)}</dd>
          </>
        ) : null}
        {deployment.commitMessage ? (
          <>
            <dt style={styles.term}>Message</dt>
            <dd style={styles.description}>{deployment.commitMessage}</dd>
          </>
        ) : null}
        {deployment.url ? (
          <>
            <dt style={styles.term}>Preview</dt>
            <dd style={styles.description}>
              <a href={deployment.url} rel="noreferrer" target="_blank">
                Open deployment
              </a>
            </dd>
          </>
        ) : null}
      </dl>
      {deployment.failureMessage ? (
        <pre style={styles.failureMessage}>{deployment.failureMessage}</pre>
      ) : null}
    </section>
  )
}

export function DeployTool() {
  const [response, setResponse] = useState<DeployResponse | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const requestDeployStatus = useCallback(
    async (method: 'GET' | 'POST', options: {ignoreCooldown?: boolean} = {}) => {
      if (!deployEndpoint) {
        setError('SANITY_STUDIO_DEPLOY_API_URL is not configured.')
        return
      }

      if (method === 'POST' && cooldownSeconds > 0 && !options.ignoreCooldown) {
        return
      }

      setIsLoading(true)
      setError(undefined)

      try {
        const result = await fetch(deployEndpoint, {
          method,
          headers:
            method === 'POST' && deployToken
              ? {
                  Authorization: `Bearer ${deployToken}`,
                  'Content-Type': 'application/json',
                }
              : undefined,
          body: method === 'POST' ? '{}' : undefined,
        })
        const body = (await result.json()) as DeployResponse

        if (!result.ok || body.error) {
          throw new Error(body.error ?? `Deploy request failed with status ${result.status}`)
        }

        setResponse(body)
        if (method === 'POST') {
          setCooldownSeconds(DEPLOY_COOLDOWN_SECONDS)
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Deploy request failed.')
      } finally {
        setIsLoading(false)
      }
    },
    [cooldownSeconds],
  )

  useEffect(() => {
    void requestDeployStatus('GET', {ignoreCooldown: true})
    // Run once on mount. Manual refresh handles later status checks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCooldownSeconds((currentSeconds) => Math.max(0, currentSeconds - 1))
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [cooldownSeconds])

  const isDeployDisabled = isLoading || !deployEndpoint || cooldownSeconds > 0

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Deploy website</h1>
          <p style={styles.copy}>
            {response?.message ?? 'Check or trigger the site deploy workflow.'}
          </p>
        </div>
        <div style={styles.actions}>
          <button
            disabled={isLoading || !deployEndpoint}
            onClick={() => void requestDeployStatus('GET')}
            style={styles.secondaryButton}
            type="button"
          >
            Refresh
          </button>
          <button
            disabled={isDeployDisabled}
            onClick={() => void requestDeployStatus('POST')}
            style={styles.primaryButton}
            type="button"
          >
            {isLoading
              ? 'Working...'
              : cooldownSeconds > 0
                ? `Deploy (${cooldownSeconds}s)`
                : 'Deploy'}
          </button>
        </div>
      </div>

      {error ? <p style={styles.error}>{error}</p> : null}

      <DeploymentDetails deployment={response?.activeDeployment} title="Active build" />
      <DeploymentDetails deployment={response?.triggeredDeployment} title="Triggered build" />
      <DeploymentDetails deployment={response?.latestDeployment} title="Latest build" />
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    display: 'grid',
    gap: '1rem',
    margin: '0 auto',
    maxWidth: '56rem',
    padding: '2rem',
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.5rem',
    lineHeight: 1.2,
    margin: 0,
  },
  copy: {
    color: '#555',
    margin: '0.5rem 0 0',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  primaryButton: {
    background: '#1f2937',
    border: 0,
    borderRadius: '0.375rem',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    padding: '0.75rem 1rem',
  },
  secondaryButton: {
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    color: '#111827',
    cursor: 'pointer',
    fontWeight: 700,
    padding: '0.75rem 1rem',
  },
  panel: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
  },
  heading: {
    fontSize: '1rem',
    margin: '0 0 1rem',
  },
  details: {
    display: 'grid',
    gap: '0.5rem 1rem',
    gridTemplateColumns: 'minmax(8rem, max-content) 1fr',
    margin: 0,
  },
  term: {
    color: '#6b7280',
    fontWeight: 700,
  },
  description: {
    margin: 0,
  },
  failureMessage: {
    background: '#fef2f2',
    borderRadius: '0.375rem',
    color: '#991b1b',
    margin: '1rem 0 0',
    overflowX: 'auto',
    padding: '0.75rem',
    whiteSpace: 'pre-wrap',
  },
  error: {
    background: '#fef2f2',
    borderRadius: '0.375rem',
    color: '#991b1b',
    margin: 0,
    padding: '0.75rem',
  },
}
