import type { ResolvedTheme, ThemeConfigChange, ThemeTemplateV1 } from '@/integrations/nibleaf/contracts/shared/themes';
export interface ProjectThemeImportResult {
  applied: boolean;
  mode: 'merge' | 'replace';
  migratedFrom?: 0;
  changes: ThemeConfigChange[];
  theme: ResolvedTheme;
  template: ThemeTemplateV1;
  publishedChangesPending: boolean;
}
