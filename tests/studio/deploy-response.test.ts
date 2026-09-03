import { describe, expect, it } from 'vitest';
import { getCompletedDeployments, type DeploymentSummary } from '../../studio-bristol-inn-vt/deploy/deploy-response';

const latestDeployment: DeploymentSummary = {
  id: 'legacy-latest',
  state: 'success',
  status: 'completed',
};

describe('getCompletedDeployments()', () => {
  it('returns an empty history when neither response shape includes a completed deployment', () => {
    expect(getCompletedDeployments({ message: 'No deploys found.' })).toEqual([]);
  });

  it('uses the previous API latestDeployment field as a one-item history', () => {
    expect(getCompletedDeployments({ message: 'Latest deploy completed.', latestDeployment })).toEqual([latestDeployment]);
  });

  it('prefers completedDeployments when the current API field is present', () => {
    const completedDeployments = [{ ...latestDeployment, id: 'current-history' }];

    expect(
      getCompletedDeployments({
        message: 'Deploy history loaded.',
        completedDeployments,
        latestDeployment,
      }),
    ).toEqual(completedDeployments);
  });
});
