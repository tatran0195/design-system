import { z } from 'zod';
import { gitOperationSchema, gitWorkflowStatusSchema } from '@/integrations/nibleaf/contracts/responses/git';
import { gitIdentitySchema, gitWebhookSecretSchema } from '@/integrations/nibleaf/contracts/responses/metadata';
import { acknowledgementSchema } from '@/shared/api/response';

export type { GitConflict, GitOperation, GitWorkflowStatus } from '@/integrations/nibleaf/contracts/response-models/git';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import type { GitConflictResolutionBody, GitConnectionBody, GitOperationBody } from '@/integrations/nibleaf/contracts/validators/git-workflow';
import { api } from '@/integrations/nibleaf/endpoints';
import { getData, mutateData } from '@/shared/api/response';

export const useGitWorkflow = (projectId: string) =>
  useQuery({
    queryKey: queryKeys.gitWorkflow.detail(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].git.$get({ param: { projectId } }, { init: { signal } }),
        'Git workflow',
        z.union([z.lazy(() => gitWorkflowStatusSchema), z.null()]),
      ),
    refetchInterval: (query) =>
      query.state.data?.operations.some((operation) => operation.status === 'QUEUED' || operation.status === 'RUNNING') ? 2500 : false,
  });

const useGitWorkflowMutation = <TVariables, TResult>(projectId: string, mutationFn: (variables: TVariables) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.gitWorkflow.detail(projectId) }),
  });
};

export const useResolveGitConflict = (projectId: string, conflictId: string) =>
  useGitWorkflowMutation(projectId, async (json: GitConflictResolutionBody) =>
    mutateData(
      await api.app.projects[':projectId'].git.conflicts[':conflictId'].resolve.$post({
        param: { projectId, conflictId },
        json,
      }),
      'Could not resolve the conflict.',
      acknowledgementSchema,
    ),
  );

export const useAuthorizeGitWorkflow = (projectId: string) =>
  useMutation({
    mutationFn: async (token: string) =>
      mutateData(
        await api.app.projects[':projectId'].git.authorize.$post({ param: { projectId }, json: { token } }),
        'Could not authorize the GitHub account.',
        z.lazy(() => gitIdentitySchema),
      ),
  });

export const useConnectGitWorkflow = (projectId: string) =>
  useGitWorkflowMutation(projectId, async (json: GitConnectionBody) =>
    mutateData(
      await api.app.projects[':projectId'].git.connection.$put({ param: { projectId }, json }),
      'Could not connect the repository.',
      z.lazy(() => gitWebhookSecretSchema),
    ),
  );

export const useDisconnectGitWorkflow = (projectId: string) =>
  useGitWorkflowMutation(projectId, async (_: undefined) =>
    mutateData(
      await api.app.projects[':projectId'].git.connection.$delete({ param: { projectId } }),
      'Could not disconnect the repository.',
      acknowledgementSchema,
    ),
  );

export const useQueueGitOperation = (projectId: string) =>
  useGitWorkflowMutation(projectId, async (json: GitOperationBody) =>
    mutateData(
      await api.app.projects[':projectId'].git.operations.$post({ param: { projectId }, json }),
      'Could not queue the Git operation.',
      z.lazy(() => gitOperationSchema),
    ),
  );

export const useRotateGitWorkflowWebhookSecret = (projectId: string) =>
  useGitWorkflowMutation(projectId, async (_: undefined) =>
    mutateData(
      await api.app.projects[':projectId'].git['webhook-secret'].$post({ param: { projectId } }),
      'Could not rotate the webhook secret.',
      z.lazy(() => gitWebhookSecretSchema),
    ),
  );
