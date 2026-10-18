import type { Deployment, DeploymentStatus } from '@/features/publishing/api';
export const DEPLOYMENT_STEP_KEYS = ['deploy.step.queued', 'deploy.step.building', 'deploy.step.indexing', 'deploy.step.live'] as const;
export function activeStep(status: DeploymentStatus | undefined): number {
  return status === 'READY' ? DEPLOYMENT_STEP_KEYS.length : status === 'BUILDING' || status === 'FAILED' ? 1 : 0;
}
export function previousReadyDeployment<Item extends Pick<Deployment, 'id' | 'status' | 'version'>>(
  deployments: readonly Item[],
  current: Item | undefined,
) {
  return deployments.find((item) => item.status === 'READY' && item.id !== current?.id && (!current || item.version < current.version));
}
