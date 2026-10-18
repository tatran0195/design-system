import { z } from 'zod';

export {
  MAX_REDIRECT_CHAIN_LENGTH,
  MAX_REDIRECT_RULES,
  normalizeRedirectPath,
  type RedirectPair,
  type RedirectValidationIssue,
  resolveRedirectTarget,
  validateRedirectGraph,
} from '@/integrations/nibleaf/contracts/shared/redirects';
export {
  addonConfigSchemas,
  addonIdParam,
  addonIdSchema,
  type ListProjectAddonAuditQuery,
  listProjectAddonAuditQuery,
  type MutateProjectAddonBody,
  mutateProjectAddonBody,
  parseAddonConfig,
  type UpdateProjectAddonBody,
  updateProjectAddonBody,
} from '@/integrations/nibleaf/contracts/validators/addons';
export {
  inferSafeInlineAssetContentType,
  isSafeInlineAssetContentType,
  normalizeAssetContentType,
  SAFE_INLINE_ASSET_CONTENT_TYPES,
  safeInlineAssetContentType,
} from '@/integrations/nibleaf/contracts/validators/assets';
export {
  type CreateIntegrationDeleteConfirmationBody,
  type CreateProjectIntegrationBody,
  configurableIntegrationProviderIdSchema,
  createIntegrationDeleteConfirmationBody,
  createProjectIntegrationBody,
  type DeleteProjectIntegrationBody,
  deleteProjectIntegrationBody,
  type IntegrationRevisionBody,
  integrationConnectionSummarySchema,
  integrationProviderIdSchema,
  integrationRevisionBody,
  type UpdateProjectIntegrationBody,
  updateProjectIntegrationBody,
  type VerifyProjectIntegrationBody,
  verifyProjectIntegrationBody,
} from '@/integrations/nibleaf/contracts/validators/integrations';
export {
  parseThemeTemplate,
  type ThemeImportBody,
  type ThemeTemplateParseResult,
  themeConfigSchema,
  themeImportBodySchema,
  themeTemplateV1Schema,
} from '@/integrations/nibleaf/contracts/validators/themes';

export const idParam = z.object({ id: z.string().min(1) });

export const projectIdParam = z.object({ projectId: z.string().min(1) });

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.string().optional(),
});
