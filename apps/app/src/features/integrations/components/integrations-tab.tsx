import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, GitBranch, PlugZap, RefreshCw, Search, ShieldCheck, Trash2, TriangleAlert } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { z } from 'zod';
import type { Project } from '@/entities/project/model';
import { AnalyticsSection } from '@/features/analytics';
import {
  useActivateProjectIntegration,
  useCreateProjectIntegration,
  useDeactivateProjectIntegration,
  useDeleteProjectIntegration,
  useProjectIntegrations,
  useUpdateProjectIntegration,
  useVerifyProjectIntegration,
} from '@/features/integrations/api';
import { CLICKHOUSE_MODE_MESSAGE_KEYS, SEARCH_RUNTIME_MESSAGE_KEYS } from '@/features/integrations/components/integration-config-values';
import type { IntegrationCatalogEntry, IntegrationProviderId, IntegrationPublicConfig } from '@/integrations/nibleaf/contracts/shared/integrations';
import { usePayloadForm } from '@/shared/forms/use-payload-form';
import { useT } from '@/shared/i18n/react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { SettingsSection } from '@/shared/ui/settings-section';
import { Skeleton } from '@/shared/ui/skeleton';
import { toast } from '@/shared/ui/sonner';
import { cn } from '@/shared/ui/utils';
import {
  AVAILABILITY_KEYS,
  CATEGORY_KEYS,
  CATEGORY_ORDER,
  type ConfigurableProviderId,
  HEALTH_KEYS,
  OWNERSHIP_KEYS,
  PLACEHOLDER_KEYS,
  PROVIDER_META,
  STATUS_KEYS,
} from '../model/catalog-presentation';

const isConfigurableProvider = (providerId: IntegrationProviderId): providerId is ConfigurableProviderId =>
  providerId === 'slack' || providerId === 'discord' || providerId === 'zapier';

const isAnalyticsProvider = (providerId: IntegrationProviderId) => providerId === 'google-analytics' || providerId === 'plausible';
const newIdempotencyKey = () => crypto.randomUUID();

function IntegrationStatus({ entry }: { entry: IntegrationCatalogEntry }) {
  const t = useT();
  const status = entry.connection?.status;
  const label = t(status ? STATUS_KEYS[status] : AVAILABILITY_KEYS[entry.availability]);
  return (
    <Badge
      className={cn(
        status === 'active' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        status === 'error' && 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
      variant="outline"
    >
      <span
        className={cn(
          'size-1.5 rounded-full bg-muted-foreground/50',
          status === 'active' && 'bg-emerald-500',
          status === 'error' && 'bg-destructive',
        )}
      />
      {label}
    </Badge>
  );
}

function CatalogCard({ entry, onSelect }: { entry: IntegrationCatalogEntry; onSelect: () => void }) {
  const t = useT();
  const meta = PROVIDER_META[entry.id];
  const Icon = meta.icon;
  return (
    <button
      className="group flex min-h-36 w-full flex-col rounded-xl border border-border bg-card p-4 text-start outline-none transition-colors hover:border-foreground/20 hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={onSelect}
      type="button"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg', meta.tint)}>
          <Icon className="size-5" />
        </span>
        <IntegrationStatus entry={entry} />
      </div>
      <div className="mt-4 font-semibold text-sm">{t(meta.name)}</div>
      <p className="mt-1 line-clamp-2 text-muted-foreground text-sm leading-relaxed">{t(meta.description)}</p>
    </button>
  );
}

function ConfigRows({ config }: { config: IntegrationPublicConfig }) {
  const t = useT();
  const rows = (() => {
    switch (config.providerId) {
      case 'github':
        return [
          [t('settings.integrations.field.repository'), config.repository],
          [t('settings.integrations.field.branch'), config.headBranch],
        ];
      case 'gitlab':
      case 'public-git':
        return [
          [t('settings.integrations.field.repository'), config.repository],
          [t('settings.integrations.field.branch'), config.branch],
        ];
      case 'google-analytics':
        return [[t('settings.integrations.field.measurementId'), config.measurementId]];
      case 'plausible':
        return [[t('settings.integrations.field.domain'), config.domain]];
      case 'slack':
      case 'discord':
      case 'zapier':
        return [[t('settings.integrations.field.label'), config.label ?? t('settings.integrations.value.notSet')]];
      case 'openrouter':
        return [
          [t('settings.integrations.field.draftModel'), config.draftModel],
          [t('settings.integrations.field.answerModel'), config.answerModel],
          [t('settings.integrations.field.embeddingModel'), config.embeddingModel],
        ];
      case 'qdrant':
        return [
          [t('settings.integrations.field.collection'), config.collectionAlias],
          [t('settings.integrations.field.runtime'), t(SEARCH_RUNTIME_MESSAGE_KEYS[config.searchRuntime])],
        ];
      case 'clickhouse':
        return [[t('settings.integrations.field.mode'), t(CLICKHOUSE_MODE_MESSAGE_KEYS[config.mode])]];
      case 'postmark':
        return [[t('settings.integrations.field.messageStream'), config.messageStream ?? t('settings.integrations.value.default')]];
      case 'cloudflare':
        return [[t('settings.integrations.field.worker'), config.workerScript]];
      default:
        return [];
    }
  })();
  if (rows.length === 0) return null;
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div className="min-w-0 rounded-lg border border-border bg-muted/20 px-3 py-2.5" key={label}>
          <dt className="text-muted-foreground text-xs">{label}</dt>
          <dd className="mt-1 truncate font-mono text-sm" dir="ltr">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ConfirmationDialog({
  open,
  destructive,
  title,
  description,
  confirmLabel,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  destructive?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const t = useT();
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={pending} onClick={() => onOpenChange(false)} type="button" variant="outline">
            {t('common.cancel')}
          </Button>
          <Button disabled={pending} onClick={onConfirm} type="button" variant={destructive ? 'destructive' : 'default'}>
            {pending ? t('common.loading') : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IntegrationDetail({
  projectId,
  project,
  entry,
  onBack,
}: {
  projectId: string;
  project: Project;
  entry: IntegrationCatalogEntry;
  onBack: () => void;
}) {
  const t = useT();
  const navigate = useNavigate();
  const meta = PROVIDER_META[entry.id];
  const Icon = meta.icon;
  const connection = entry.connection;
  const create = useCreateProjectIntegration(projectId);
  const update = useUpdateProjectIntegration(projectId);
  const activate = useActivateProjectIntegration(projectId);
  const deactivate = useDeactivateProjectIntegration(projectId);
  const verify = useVerifyProjectIntegration(projectId);
  const remove = useDeleteProjectIntegration(projectId);
  const connectionConfig = connection?.config;
  const labelForm = usePayloadForm(z.object({ label: z.string() }), {
    label:
      connectionConfig?.providerId === 'slack' || connectionConfig?.providerId === 'discord' || connectionConfig?.providerId === 'zapier'
        ? (connectionConfig.label ?? '')
        : '',
  });
  const [label, setLabel] = labelForm.field('label');
  const webhookForm = usePayloadForm(z.object({ webhookUrl: z.string() }), { webhookUrl: '' });
  const [webhookUrl, setWebhookUrl] = webhookForm.field('webhookUrl');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const pending = create.isPending || update.isPending || activate.isPending || deactivate.isPending || verify.isPending || remove.isPending;

  if (isAnalyticsProvider(entry.id)) {
    return (
      <div className="flex flex-col gap-4">
        <Button className="w-fit" onClick={onBack} size="sm" variant="ghost">
          <ArrowLeft className="rtl:-scale-x-100" />
          {t('settings.integrations.allIntegrations')}
        </Button>
        <AnalyticsSection project={project} />
      </div>
    );
  }

  const notifyError = () => toast.error(t('settings.integrations.actionError'));
  const save = async (event: FormEvent) =>
    webhookForm.submit(async (submitted) => {
      const { webhookUrl } = submitted;

      event.preventDefault();
      if (pending) return;
      if (!isConfigurableProvider(entry.id)) return;
      if (!connection && !webhookUrl) {
        toast.error(t('settings.integrations.webhookRequired'));
        return;
      }
      try {
        if (connection) {
          await update.mutateAsync({
            providerId: entry.id,
            body: {
              providerId: entry.id,
              label: label.trim() || null,
              expectedRevision: connection.revision,
              idempotencyKey: newIdempotencyKey(),
              ...(webhookUrl ? { webhookUrl, replaceCredential: true as const } : {}),
            },
          });
          toast.success(t('settings.integrations.updatedToast'));
        } else {
          const base = { webhookUrl, label: label.trim() || undefined, idempotencyKey: newIdempotencyKey() };
          const body =
            entry.id === 'slack'
              ? { providerId: 'slack' as const, ...base }
              : entry.id === 'discord'
                ? { providerId: 'discord' as const, ...base }
                : { providerId: 'zapier' as const, ...base };
          await create.mutateAsync(body);
          toast.success(t('settings.integrations.connectedToast', { name: t(meta.name) }));
        }
        setWebhookUrl('');
      } catch {
        notifyError();
      }
    })();

  const changeStatus = async () => {
    if (pending) return;
    if (!connection || !isConfigurableProvider(entry.id)) return;
    try {
      const mutation = connection.status === 'inactive' ? activate : deactivate;
      await mutation.mutateAsync({ providerId: entry.id, body: { expectedRevision: connection.revision, idempotencyKey: newIdempotencyKey() } });
      toast.success(t(connection.status === 'inactive' ? 'settings.integrations.activatedToast' : 'settings.integrations.deactivatedToast'));
    } catch {
      notifyError();
    }
  };

  const runVerify = async (confirmed = false) => {
    if (pending) return;
    if (entry.verificationSideEffect && !confirmed) {
      setVerifyOpen(true);
      return;
    }
    try {
      const body =
        entry.id === 'github'
          ? { providerId: 'github' as const }
          : isConfigurableProvider(entry.id) && connection
            ? {
                providerId: entry.id,
                expectedRevision: connection.revision,
                idempotencyKey: newIdempotencyKey(),
                ...(entry.verificationSideEffect ? { confirmExternalSideEffect: true } : {}),
              }
            : null;
      if (!body) return;
      await verify.mutateAsync({ providerId: entry.id, body });
      setVerifyOpen(false);
      toast.success(t('settings.integrations.verifiedToast'));
    } catch {
      notifyError();
    }
  };

  const deleteConnection = async () => {
    if (pending) return;
    if (!connection || !isConfigurableProvider(entry.id)) return;
    try {
      await remove.mutateAsync({ providerId: entry.id, expectedRevision: connection.revision });
      setDeleteOpen(false);
      toast.success(t('settings.integrations.deletedToast'));
      onBack();
    } catch {
      notifyError();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button className="w-fit" onClick={onBack} size="sm" variant="ghost">
        <ArrowLeft className="rtl:-scale-x-100" />
        {t('settings.integrations.allIntegrations')}
      </Button>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl', meta.tint)}>
            <Icon className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-lg">{t(meta.name)}</h2>
              <IntegrationStatus entry={entry} />
            </div>
            <p className="mt-1 text-muted-foreground text-sm leading-relaxed">{t(meta.description)}</p>
          </div>
        </div>
      </section>

      {connection ? (
        <SettingsSection title={t('settings.integrations.statusTitle')} description={t('settings.integrations.statusDescription')}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground text-xs">{t('settings.integrations.health')}</div>
              <div className="mt-1 font-medium text-sm">{t(HEALTH_KEYS[connection.health.status])}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground text-xs">{t('settings.integrations.credentials')}</div>
              <div className="mt-1 font-medium text-sm">
                {connection.credential?.configured ? t('settings.integrations.configured') : t('settings.integrations.notRequired')}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground text-xs">{t('settings.integrations.ownership')}</div>
              <div className="mt-1 font-medium text-sm">{t(OWNERSHIP_KEYS[connection.ownership])}</div>
            </div>
          </div>
          <div className="mt-4">
            <ConfigRows config={connection.config} />
          </div>
        </SettingsSection>
      ) : null}

      {entry.navigation.settingsSection && entry.navigation.settingsSection !== 'integrations' ? (
        <SettingsSection title={t('settings.integrations.configuration')} description={t('settings.integrations.adapterOwned')}>
          <Button
            onClick={() =>
              navigate({
                to: '/app/projects/$projectId/settings',
                params: { projectId },
                search: { section: entry.navigation.settingsSection ?? 'integrations' },
                replace: true,
              })
            }
          >
            <GitBranch />
            {t('settings.integrations.openGitSettings')}
          </Button>
        </SettingsSection>
      ) : null}

      {entry.lifecycle === 'managed' ? (
        <Alert variant={entry.availability === 'available' ? 'success' : 'warning'}>
          {entry.availability === 'available' ? <ShieldCheck /> : <TriangleAlert />}
          <AlertTitle>
            {t(entry.availability === 'available' ? 'settings.integrations.managedReady' : 'settings.integrations.managedUnavailable')}
          </AlertTitle>
          <AlertDescription>{t('settings.integrations.managedDescription')}</AlertDescription>
        </Alert>
      ) : null}

      {isConfigurableProvider(entry.id) ? (
        <SettingsSection title={t('settings.integrations.configuration')} description={t('settings.integrations.webhookDescription')}>
          <form className="flex flex-col gap-4" onSubmit={save}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${entry.id}-label`}>{t('settings.integrations.field.label')}</Label>
                <Input
                  className="h-9"
                  id={`${entry.id}-label`}
                  maxLength={80}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder={t('settings.integrations.labelPlaceholder')}
                  value={label}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${entry.id}-url`}>{t('settings.integrations.webhookUrl')}</Label>
                <Input
                  autoComplete="off"
                  className="h-9 font-mono"
                  dir="ltr"
                  id={`${entry.id}-url`}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder={connection ? t('settings.integrations.credentialKept') : t(PLACEHOLDER_KEYS[entry.id])}
                  required={!connection}
                  type="password"
                  value={webhookUrl}
                />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              <ShieldCheck className="me-1 inline size-3.5" />
              {t('settings.integrations.credentialPrivacy')}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button className="h-9" disabled={pending} type="submit">
                {connection ? t('common.save') : t('settings.integrations.connect')}
              </Button>
              {connection ? (
                <Button className="h-9" disabled={pending} onClick={changeStatus} type="button" variant="outline">
                  {connection.status === 'inactive' ? t('settings.integrations.activate') : t('settings.integrations.deactivate')}
                </Button>
              ) : null}
              {connection && (entry.supportsPassiveVerification || entry.verificationSideEffect) ? (
                <Button
                  className="h-9"
                  disabled={pending || connection.status !== 'active'}
                  onClick={() => runVerify()}
                  type="button"
                  variant="outline"
                >
                  <RefreshCw />
                  {t(entry.verificationSideEffect ? 'settings.integrations.sendTest' : 'settings.integrations.verify')}
                </Button>
              ) : null}
              {connection ? (
                <Button className="h-9 sm:ms-auto" disabled={pending} onClick={() => setDeleteOpen(true)} type="button" variant="destructive">
                  <Trash2 />
                  {t('common.delete')}
                </Button>
              ) : null}
            </div>
          </form>
        </SettingsSection>
      ) : null}

      <ConfirmationDialog
        confirmLabel={t('settings.integrations.sendTest')}
        description={t('settings.integrations.sendTestDescription')}
        onConfirm={() => runVerify(true)}
        onOpenChange={setVerifyOpen}
        open={verifyOpen}
        pending={verify.isPending}
        title={t('settings.integrations.sendTestTitle')}
      />
      <ConfirmationDialog
        confirmLabel={t('common.delete')}
        description={t('settings.integrations.deleteDescription', { name: t(meta.name) })}
        destructive
        onConfirm={deleteConnection}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        pending={remove.isPending}
        title={t('settings.integrations.deleteTitle')}
      />
    </div>
  );
}

export function IntegrationsTab({ projectId, project }: { projectId?: string; project?: Project }) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<IntegrationProviderId | null>(null);
  const integrations = useProjectIntegrations(projectId ?? '');
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return integrations.data ?? [];
    return (integrations.data ?? []).filter((entry) => {
      const meta = PROVIDER_META[entry.id];
      return [t(meta.name), t(meta.description), t(CATEGORY_KEYS[entry.category])].some((value) => value.toLocaleLowerCase().includes(query));
    });
  }, [integrations.data, search, t]);
  const selected = integrations.data?.find((entry) => entry.id === selectedId) ?? null;

  if (projectId && project && selected) {
    return (
      <IntegrationDetail
        entry={selected}
        key={`${selected.id}:${selected.connection?.revision ?? 0}`}
        onBack={() => setSelectedId(null)}
        project={project}
        projectId={projectId}
      />
    );
  }

  return (
    <SettingsSection title={t('settings.integrations.title')} description={t('settings.integrations.subtitle')}>
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label={t('settings.integrations.search')}
          className="h-9 ps-9"
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('settings.integrations.search')}
          type="search"
          value={search}
        />
      </div>
      {integrations.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : null}
      {integrations.isError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>{t('settings.integrations.loadError')}</AlertTitle>
          <AlertDescription>{t('settings.integrations.loadErrorDescription')}</AlertDescription>
          <Button className="mt-2 w-fit" onClick={() => integrations.refetch()} size="sm" variant="outline">
            {t('common.retry')}
          </Button>
        </Alert>
      ) : null}
      {!integrations.isLoading && !integrations.isError && filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <PlugZap className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium text-sm">{t('settings.integrations.noResults')}</p>
          <p className="mt-1 text-muted-foreground text-sm">{t('settings.integrations.noResultsDescription')}</p>
        </div>
      ) : null}
      {!integrations.isLoading && !integrations.isError ? (
        <div className="flex flex-col gap-7">
          {CATEGORY_ORDER.map((category) => {
            const entries = filtered.filter((entry) => entry.category === category);
            if (entries.length === 0) return null;
            return (
              <section key={category}>
                <h2 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t(CATEGORY_KEYS[category])}</h2>
                <div className={cn('grid gap-3', entries.length > 1 ? 'sm:grid-cols-2' : 'max-w-2xl')}>
                  {entries.map((entry) => (
                    <CatalogCard entry={entry} key={entry.id} onSelect={() => setSelectedId(entry.id)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </SettingsSection>
  );
}
