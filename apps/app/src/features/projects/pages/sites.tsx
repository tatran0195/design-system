import { getRouteApi, Link } from '@tanstack/react-router';
import { ArrowUpRight, FileText, Plus, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useProjects } from '@/entities/project/api';
import { NewProjectDialog } from '@/features/projects';
import { useT } from '@/shared/i18n/react';
import { useFormatters } from '@/shared/lib/format';
import { NibleafMark } from '@/shared/ui/brand';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';

const routeApi = getRouteApi('/app/(dashboard)/sites');
export function SitesPage() {
  const { newSite } = routeApi.useSearch();
  const { data: projects, isPending } = useProjects();
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(Boolean(newSite));
  const t = useT();
  const { number } = useFormatters();
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? (projects ?? []).filter((project) => `${project.name} ${project.slug}`.toLowerCase().includes(normalized)) : (projects ?? []);
  }, [projects, query]);

  return (
    <div className="ms-auto me-[3%] flex w-full max-w-[824px] flex-col gap-5 py-6 lg:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-medium text-base text-ui-fg-base">{t('project.allSites')}</h1>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="w-44 max-w-full">
            <Input
              aria-label={t('dashboard.search.placeholder')}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('dashboard.search.placeholder')}
              type="search"
              value={query}
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" /> {t('dashboard.newProject')}
          </Button>
        </div>
      </div>
      {isPending ? (
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-60 rounded-lg" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="flex flex-col gap-5">
          {filtered.map((project) => {
            const socialImage = project.config?.seo?.socialImage;
            const logo = project.config?.branding?.logoLight ?? project.config?.branding?.logoDark ?? project.config?.branding?.favicon;
            const image = socialImage ?? logo;
            const primaryColor = project.config?.styling?.primaryColor;
            return (
              <article
                key={project.id}
                className="grid min-h-[270px] min-w-0 overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base md:grid-cols-[minmax(0,0.37fr)_minmax(0,0.63fr)]"
              >
                <div
                  className="flex min-h-32 items-center justify-center border-ui-border-base border-b bg-ui-bg-subtle p-8 md:min-h-[270px] md:border-e md:border-b-0"
                  style={{
                    backgroundColor: primaryColor ? `color-mix(in srgb, ${primaryColor} 9%, var(--ui-bg-subtle))` : undefined,
                  }}
                >
                  {image ? (
                    <img
                      alt={`${project.name} preview`}
                      className={socialImage ? 'h-full max-h-56 w-full object-cover' : 'max-h-24 max-w-[80%] object-contain'}
                      loading="lazy"
                      src={image}
                    />
                  ) : project.icon ? (
                    <span aria-label={`${project.name} icon`} className="text-5xl" role="img">
                      {project.icon}
                    </span>
                  ) : (
                    <NibleafMark className="size-14" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-3 p-4">
                  <h2 className="truncate font-medium text-base text-ui-fg-base">{project.name}</h2>
                  <div className="min-w-0">
                    <p className="text-ui-fg-subtle text-xs">{t('dashboard.col.site')}</p>
                    <Link
                      className="mt-1 block truncate text-sm text-ui-fg-base hover:underline"
                      to="/app/projects/$projectId"
                      params={{ projectId: project.id }}
                    >
                      /{project.slug}
                    </Link>
                  </div>
                  {project.description ? <p className="line-clamp-2 text-sm text-ui-fg-subtle">{project.description}</p> : null}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ui-fg-subtle text-sm">
                    <span className="flex items-center gap-2">
                      <FileText className="size-4" /> {t('dashboard.pages', { count: number(project._count?.pages ?? 0) })}
                    </span>
                    <span>
                      {t('dashboard.col.deploys')}: {number(project._count?.deployments ?? 0)}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center gap-2 border-ui-border-base border-t pt-3">
                    <Button
                      className="min-w-0 flex-1"
                      size="sm"
                      variant="outline"
                      nativeButton={false}
                      render={<Link to="/app/projects/$projectId" params={{ projectId: project.id }} />}
                    >
                      {t('nav.overview')} <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
                    </Button>
                    <Button
                      className="size-7 p-0"
                      size="sm"
                      variant="outline"
                      aria-label={`${t('nav.settings')}: ${project.name}`}
                      title={t('nav.settings')}
                      nativeButton={false}
                      render={<Link to="/app/projects/$projectId/settings" params={{ projectId: project.id }} search={{ section: 'general' }} />}
                    >
                      <Settings className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border text-center">
          <div>
            <NibleafMark className="mx-auto size-9" />
            <p className="mt-3 font-medium">{t('dashboard.empty.title')}</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> {t('dashboard.empty.cta')}
            </Button>
          </div>
        </div>
      )}
      <NewProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
