import { Activity, Bot, ChartNoAxesCombined, Cloud, Database, GitBranch, HardDrive, Mail, MessageSquare, Rocket, Send, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import type { IntegrationCatalogEntry, IntegrationCategory, IntegrationProviderId } from '@/integrations/nibleaf/contracts/shared/integrations';
import type { MessageKey } from '@/shared/i18n';
import { GithubIcon, SlackIcon } from '@/shared/ui/icons/brand';
export type ConfigurableProviderId = 'slack' | 'discord' | 'zapier';
export type ProviderIcon = ComponentType<{ className?: string }>;

export const CATEGORY_ORDER: IntegrationCategory[] = ['source_control', 'deployment', 'ai', 'email', 'analytics', 'storage', 'webhook'];

export const PROVIDER_META: Record<IntegrationProviderId, { name: MessageKey; description: MessageKey; icon: ProviderIcon; tint: string }> = {
  github: {
    name: 'settings.integrations.provider.github',
    description: 'settings.integrations.github.description',
    icon: GithubIcon,
    tint: 'bg-foreground/10 text-foreground',
  },
  gitlab: {
    name: 'settings.integrations.provider.gitlab',
    description: 'settings.integrations.gitlab.description',
    icon: GitBranch,
    tint: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  },
  'public-git': {
    name: 'settings.integrations.provider.publicGit',
    description: 'settings.integrations.publicGit.description',
    icon: GitBranch,
    tint: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  },
  'google-analytics': {
    name: 'settings.integrations.provider.googleAnalytics',
    description: 'settings.integrations.googleAnalytics.description',
    icon: ChartNoAxesCombined,
    tint: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  plausible: {
    name: 'settings.integrations.provider.plausible',
    description: 'settings.integrations.plausible.description',
    icon: Activity,
    tint: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  },
  slack: {
    name: 'settings.integrations.provider.slack',
    description: 'settings.integrations.slack.description',
    icon: SlackIcon,
    tint: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  },
  discord: {
    name: 'settings.integrations.provider.discord',
    description: 'settings.integrations.discord.description',
    icon: MessageSquare,
    tint: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
  zapier: {
    name: 'settings.integrations.provider.zapier',
    description: 'settings.integrations.zapier.description',
    icon: Zap,
    tint: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  openrouter: {
    name: 'settings.integrations.provider.openrouter',
    description: 'settings.integrations.openrouter.description',
    icon: Bot,
    tint: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300',
  },
  qdrant: {
    name: 'settings.integrations.provider.qdrant',
    description: 'settings.integrations.qdrant.description',
    icon: Database,
    tint: 'bg-red-500/15 text-red-700 dark:text-red-300',
  },
  clickhouse: {
    name: 'settings.integrations.provider.clickhouse',
    description: 'settings.integrations.clickhouse.description',
    icon: Database,
    tint: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  },
  postmark: {
    name: 'settings.integrations.provider.postmark',
    description: 'settings.integrations.postmark.description',
    icon: Send,
    tint: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  },
  smtp: {
    name: 'settings.integrations.provider.smtp',
    description: 'settings.integrations.smtp.description',
    icon: Mail,
    tint: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  },
  maxio: {
    name: 'settings.integrations.provider.maxio',
    description: 'settings.integrations.maxio.description',
    icon: HardDrive,
    tint: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  },
  minio: {
    name: 'settings.integrations.provider.minio',
    description: 'settings.integrations.minio.description',
    icon: HardDrive,
    tint: 'bg-red-500/15 text-red-700 dark:text-red-300',
  },
  'amazon-s3': {
    name: 'settings.integrations.provider.amazonS3',
    description: 'settings.integrations.amazonS3.description',
    icon: HardDrive,
    tint: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  },
  'cloudflare-r2': {
    name: 'settings.integrations.provider.cloudflareR2',
    description: 'settings.integrations.cloudflareR2.description',
    icon: Cloud,
    tint: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  },
  'backblaze-b2': {
    name: 'settings.integrations.provider.backblazeB2',
    description: 'settings.integrations.backblazeB2.description',
    icon: HardDrive,
    tint: 'bg-red-500/15 text-red-700 dark:text-red-300',
  },
  cloudflare: {
    name: 'settings.integrations.provider.cloudflare',
    description: 'settings.integrations.cloudflare.description',
    icon: Rocket,
    tint: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  },
};

export const CATEGORY_KEYS: Record<IntegrationCategory, MessageKey> = {
  source_control: 'settings.integrations.category.sourceControl',
  deployment: 'settings.integrations.category.deployment',
  ai: 'settings.integrations.category.ai',
  email: 'settings.integrations.category.email',
  analytics: 'settings.integrations.category.analytics',
  storage: 'settings.integrations.category.storage',
  webhook: 'settings.integrations.category.webhook',
};

export const STATUS_KEYS = {
  active: 'settings.integrations.status.active',
  inactive: 'settings.integrations.status.inactive',
  error: 'settings.integrations.status.error',
} as const satisfies Record<NonNullable<IntegrationCatalogEntry['connection']>['status'], MessageKey>;

export const AVAILABILITY_KEYS = {
  available: 'settings.integrations.availability.available',
  not_configured: 'settings.integrations.availability.notConfigured',
  unavailable: 'settings.integrations.availability.unavailable',
} as const satisfies Record<IntegrationCatalogEntry['availability'], MessageKey>;

export const HEALTH_KEYS = {
  healthy: 'settings.integrations.health.healthy',
  unhealthy: 'settings.integrations.health.unhealthy',
  unverified: 'settings.integrations.health.unverified',
} as const satisfies Record<NonNullable<IntegrationCatalogEntry['connection']>['health']['status'], MessageKey>;

export const OWNERSHIP_KEYS = {
  project: 'settings.integrations.ownership.project',
  instance: 'settings.integrations.ownership.instance',
} as const satisfies Record<NonNullable<IntegrationCatalogEntry['connection']>['ownership'], MessageKey>;

export const PLACEHOLDER_KEYS = {
  slack: 'settings.integrations.placeholder.slack',
  discord: 'settings.integrations.placeholder.discord',
  zapier: 'settings.integrations.placeholder.zapier',
} as const satisfies Record<ConfigurableProviderId, MessageKey>;
