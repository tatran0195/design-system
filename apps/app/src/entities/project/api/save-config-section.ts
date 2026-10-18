import type { ProjectConfigUpdate } from '@/integrations/nibleaf/contracts/validators/project-config';
import type { MessageKey } from '@/shared/i18n';
import { translateFn } from '@/shared/i18n/react';
import { toast } from '@/shared/ui/sonner';

type ConfigMutation = {
  mutate: (vars: { config: ProjectConfigUpdate }, opts?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => void;
};

const localizedFn = (key: MessageKey): string => translateFn(key);

/**
 * Wraps `useUpdateProjectConfig(...).mutate` in a promise + toast so a RHF
 * form `onSubmit` can `await` it. The server deep-merges section-level config,
 * so callers pass just the one section they own (e.g. `{ footer: {...} }`).
 */
export function saveConfigSection(update: ConfigMutation, config: ProjectConfigUpdate) {
  return new Promise<void>((resolve) => {
    update.mutate(
      { config },
      {
        onSuccess: () => {
          toast.success(localizedFn('common.saved'));
          resolve();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : localizedFn('settings.saveError'));
          resolve();
        },
      },
    );
  });
}
