export type DeploymentState = 'success' | 'failure' | 'cancelled' | 'active' | 'unknown'

export type DeploymentSummary = {
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

export type DeployResponse = {
  message: string
  activeDeployment?: DeploymentSummary
  completedDeployments?: DeploymentSummary[]
  latestDeployment?: DeploymentSummary
  error?: string
}

export function getCompletedDeployments(response?: DeployResponse): DeploymentSummary[] {
  if (Array.isArray(response?.completedDeployments)) {
    return response.completedDeployments
  }

  return response?.latestDeployment ? [response.latestDeployment] : []
}
