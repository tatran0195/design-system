import { z } from 'zod';
import { saveConfigSection, useUpdateProjectConfig } from '@/entities/project/api';
import type { Project } from '@/entities/project/model';
import { useFieldForm as useForm } from '@/shared/forms/use-field-form';
import { usePayloadForm } from '@/shared/forms/use-payload-form';
import { useT } from '@/shared/i18n/react';
import { FieldError } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { FIELD_MONO, Field, SaveBar, SectionHeader, ToggleRow } from '@/shared/ui/settings-controls';

// Match the shapes the live-site injector accepts, so an invalid id is caught in
// the form instead of being silently dropped (and never emitting analytics).
const GA4_RE = /^G-[A-Z0-9]+$/i;
const PLAUSIBLE_RE = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

export function AnalyticsSection({ project }: { project: Project }) {
  const t = useT();
  const update = useUpdateProjectConfig(project.id);
  const analytics = project.config?.analytics ?? {};
  const analyticsForm = usePayloadForm(z.object({ campaignDimensions: z.boolean(), storePublicSearchTerms: z.boolean() }), {
    campaignDimensions: analytics.campaignDimensions ?? false,
    storePublicSearchTerms: analytics.storePublicSearchTerms ?? false,
  });
  const [campaignDimensions, setCampaignDimensions] = analyticsForm.field('campaignDimensions');
  const [storePublicSearchTerms, setStorePublicSearchTerms] = analyticsForm.field('storePublicSearchTerms');

  const form = useForm({
    defaultValues: {
      ga4: analytics.ga4 ?? '',
      plausible: analytics.plausible ?? '',
    },
    onSubmit: async ({ value }) => {
      await saveConfigSection(update, {
        analytics: {
          ga4: value.ga4.trim() || undefined,
          plausible: value.plausible.trim() || undefined,
          campaignDimensions,
          storePublicSearchTerms,
        },
      });
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <SectionHeader icon="◴" title={t('settings.analytics.title')} />

      <form.Field
        name="ga4"
        validators={{ onChange: ({ value }) => (value.trim() && !GA4_RE.test(value.trim()) ? t('settings.analytics.ga4.error') : undefined) }}
      >
        {(field) => (
          <Field hint={t('settings.analytics.ga4.hint')} label={t('settings.analytics.ga4.label')}>
            <Input
              className={FIELD_MONO}
              dir="ltr"
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              value={field.state.value}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field
        name="plausible"
        validators={{
          onChange: ({ value }) => (value.trim() && !PLAUSIBLE_RE.test(value.trim()) ? t('settings.analytics.plausible.error') : undefined),
        }}
      >
        {(field) => (
          <Field hint={t('settings.analytics.plausible.hint')} label={t('settings.analytics.plausible.label')}>
            <Input
              className={FIELD_MONO}
              dir="ltr"
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="docs.yoursite.com"
              value={field.state.value}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <div className="mb-5 rounded-lg border border-border bg-muted/30 p-3 text-muted-foreground text-sm">
        {t('settings.analytics.cookieConsent.managed')}
      </div>

      <ToggleRow
        checked={campaignDimensions}
        hint={t('settings.analytics.campaignDimensions.hint')}
        onCheckedChange={setCampaignDimensions}
        title={t('settings.analytics.campaignDimensions.title')}
      />

      <ToggleRow
        checked={storePublicSearchTerms}
        hint={t('settings.analytics.searchTerms.hint')}
        onCheckedChange={setStorePublicSearchTerms}
        title={t('settings.analytics.searchTerms.title')}
      />

      <div className="mt-4">
        <form.Subscribe selector={(state) => state.isSubmitting}>{(isSubmitting) => <SaveBar isSubmitting={isSubmitting} />}</form.Subscribe>
      </div>
    </form>
  );
}
