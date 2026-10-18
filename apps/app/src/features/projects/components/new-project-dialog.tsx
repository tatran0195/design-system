import { useCreateProject } from '@/entities/project/api';
import { required } from '@/shared/forms/form';
import { useFieldForm as useForm } from '@/shared/forms/use-field-form';
import { useT } from '@/shared/i18n/react';
import { Button } from '@/shared/ui/button';
import { FieldError } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { toast } from '@/shared/ui/sonner';
import { FocusModal, Heading, Text } from '@cms/ui';

export function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const create = useCreateProject();
  const t = useT();
  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      await new Promise<void>((resolve) => {
        create.mutate(
          { name: value.name.trim() },
          {
            onSuccess: () => {
              toast.success(t('newSite.created'));
              form.reset();
              onOpenChange(false);
              resolve();
            },
            onError: (error) => {
              toast.error(error instanceof Error ? error.message : t('newSite.error'));
              resolve();
            },
          },
        );
      });
    },
  });
  return (
    <FocusModal onOpenChange={onOpenChange} open={open}>
      <FocusModal.Content>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FocusModal.Header />
          <FocusModal.Body className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-8 sm:px-8 sm:py-16">
            <div className="flex w-full max-w-[720px] flex-col gap-y-8">
              <div>
                <FocusModal.Title asChild><Heading>{t('newSite.title')}</Heading></FocusModal.Title>
                <FocusModal.Description asChild><Text size="small" className="text-ui-fg-subtle">{t('newSite.desc')}</Text></FocusModal.Description>
              </div>
          <div className="flex flex-col gap-1.5">
            <form.Field name="name" validators={{ onChange: ({ value }) => required(t('newSite.name'), t)(value) }}>
              {(field) => (
                <>
                  <Label htmlFor="new-project-name">{t('newSite.name')}</Label>
                  <Input
                    autoFocus
                    id="new-project-name"
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t('newSite.namePlaceholder')}
                    value={field.state.value}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </>
              )}
            </form.Field>
          </div>
            </div>
          </FocusModal.Body>
          <FocusModal.Footer>
            <FocusModal.Close asChild><Button size="sm" type="button" variant="outline">{t('common.cancel')}</Button></FocusModal.Close>
            <form.Subscribe selector={(state) => [state.isSubmitting, state.values.name] as const}>
              {([isSubmitting, name]) => (
                <Button disabled={isSubmitting || !name.trim()} size="sm" type="submit">
                  {isSubmitting ? t('newSite.creating') : t('newSite.create')}
                </Button>
              )}
            </form.Subscribe>
          </FocusModal.Footer>
        </form>
      </FocusModal.Content>
    </FocusModal>
  );
}
