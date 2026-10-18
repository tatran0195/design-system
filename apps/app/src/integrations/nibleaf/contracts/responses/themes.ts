/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type {
  ResolvedTheme,
  ThemeColorKey,
  ThemeColorTokens,
  ThemeComponents,
  ThemeConfigChange,
  ThemeLayout,
  ThemeMetadata,
  ThemePresetId,
} from '@/integrations/nibleaf/contracts/shared/themes';
export const themeConfigChangeSchema: z.ZodType<ThemeConfigChange> = z.object({ path: z.string(), before: z.unknown(), after: z.unknown() });
export const resolvedThemeSchema: z.ZodType<ResolvedTheme> = z.object({
  id: z.lazy(() => themePresetIdSchema),
  metadata: z.lazy(() => themeMetadataSchema),
  colors: z.object({ light: z.lazy(() => themeColorTokensSchema), dark: z.lazy(() => themeColorTokensSchema) }),
  layout: z.lazy(() => themeLayoutSchema),
  components: z.lazy(() => themeComponentsSchema),
});
export const themePresetIdSchema: z.ZodType<ThemePresetId> = z.union([z.literal('harbor'), z.literal('manuscript'), z.literal('signal')]);
export const themeMetadataSchema: z.ZodType<ThemeMetadata> = z.object({ name: z.string(), description: z.string(), author: z.string().optional() });
export const themeColorTokensSchema: z.ZodType<ThemeColorTokens> = z.record(
  z.lazy(() => themeColorKeySchema),
  z.string(),
);
export const themeLayoutSchema: z.ZodType<ThemeLayout> = z.object({
  shell: z.union([z.literal('reference'), z.literal('editorial'), z.literal('console')]),
  density: z.union([z.literal('compact'), z.literal('comfortable'), z.literal('relaxed')]),
  radius: z.union([z.literal('sharp'), z.literal('rounded'), z.literal('pill')]),
  contentWidth: z.union([z.literal('focused'), z.literal('balanced'), z.literal('wide')]),
  header: z.union([z.literal('inline'), z.literal('stacked'), z.literal('floating')]),
  sidebar: z.union([z.literal('bordered'), z.literal('soft'), z.literal('rail')]),
  navigation: z.union([z.literal('tree'), z.literal('sectioned'), z.literal('compact')]),
});
export const themeComponentsSchema: z.ZodType<ThemeComponents> = z.object({
  codeBlocks: z.union([z.literal('system'), z.literal('dim'), z.literal('vivid')]),
  callouts: z.union([z.literal('soft'), z.literal('outline'), z.literal('solid')]),
  cards: z.union([z.literal('bordered'), z.literal('lifted'), z.literal('flat')]),
  tabs: z.union([z.literal('underline'), z.literal('pills'), z.literal('boxed')]),
  tables: z.union([z.literal('lines'), z.literal('rows'), z.literal('cards')]),
});
export const themeColorKeySchema: z.ZodType<ThemeColorKey> = z.union([
  z.literal('canvas'),
  z.literal('foreground'),
  z.literal('surface'),
  z.literal('surfaceRaised'),
  z.literal('muted'),
  z.literal('mutedForeground'),
  z.literal('border'),
  z.literal('accent'),
  z.literal('accentForeground'),
  z.literal('focus'),
  z.literal('code'),
  z.literal('codeForeground'),
  z.literal('info'),
  z.literal('success'),
  z.literal('warning'),
  z.literal('danger'),
]);
