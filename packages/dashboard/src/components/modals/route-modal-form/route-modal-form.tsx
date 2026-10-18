'use client';
import { Prompt } from '@cms/ui';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from '../../../i18n';
import { Form } from '../../common/form';
import { useRouteModal } from '../route-modal-provider';
export interface RouteModalFormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  children: ReactNode;
  onClose?: (submitted: boolean) => void;
  preventUnsavedClose?: boolean;
}
export function RouteModalForm<TFieldValues extends FieldValues>({
  form,
  children,
  onClose,
  preventUnsavedClose = true,
}: RouteModalFormProps<TFieldValues>) {
  const { t } = useTranslation();
  const { registerCloseGuard } = useRouteModal();
  const [confirming, setConfirming] = useState(false);
  const resolver = useRef<((proceed: boolean) => void) | null>(null);
  const { isDirty, isSubmitting, isSubmitSuccessful } = form.formState;
  const state = useRef({ isDirty, isSubmitting, isSubmitSuccessful, onClose, preventUnsavedClose });
  state.current = { isDirty, isSubmitting, isSubmitSuccessful, onClose, preventUnsavedClose };
  useEffect(
    () =>
      registerCloseGuard(() => {
        const current = state.current;
        if (current.isSubmitting) return false;
        if (!current.preventUnsavedClose || !current.isDirty || current.isSubmitSuccessful) {
          current.onClose?.(current.isSubmitSuccessful);
          return true;
        }
        setConfirming(true);
        return new Promise<boolean>((resolve) => {
          resolver.current = (proceed) => {
            if (proceed) current.onClose?.(false);
            resolve(proceed);
          };
        });
      }),
    [registerCloseGuard],
  );
  useEffect(
    () => () => {
      resolver.current?.(false);
    },
    [],
  );
  useEffect(() => {
    if (!isDirty || !preventUnsavedClose || typeof window === 'undefined') return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [isDirty, preventUnsavedClose]);
  const resolve = (proceed: boolean) => {
    const callback = resolver.current;
    resolver.current = null;
    setConfirming(false);
    callback?.(proceed);
  };
  return (
    <Form {...form}>
      {children}
      <Prompt
        open={confirming}
        onOpenChange={(open) => {
          if (!open) resolve(false);
        }}
        variant="confirmation"
      >
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>{t('general.unsavedChangesTitle')}</Prompt.Title>
            <Prompt.Description>{t('general.unsavedChangesDescription')}</Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel type="button" onClick={() => resolve(false)}>
              {t('actions.cancel')}
            </Prompt.Cancel>
            <Prompt.Action type="button" onClick={() => resolve(true)}>
              {t('actions.continue')}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Form>
  );
}
