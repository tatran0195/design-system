# Module/public API catalog

Explicit public entry files; implementation imports across owners are rejected.

## entities/content

- `api.ts`: `useCreateBranch`, `useCreateLanguage`, `useCreatePage`, `useDeleteLanguage`, `useDeletePage`, `useMergeBranch`, `useReorderPages`, `useUpdateLanguage`, `useUpdatePage`, `useUploadAsset`, ``, `useBranches`, `useLanguages`, `usePage`, `usePages`
- `index.ts`: `CatalogLanguage`, `LANGUAGE_CATALOG`
- `model.ts`: `LanguageConfig`, `PageConfig`, `Asset`, `Branch`, `Language`, `Page`, `PageNode`

## entities/project

- `api.ts`: `useCreateProject`, `useDeleteProject`, `useUpdateProject`, `useUpdateProjectConfig`, `useProject`, `useProjects`, `saveConfigSection`
- `index.ts`: `ProjectProvider`
- `model.ts`: `ProjectConfig`, `Project`

## entities/workspace

- `api.ts`: `useUpdateWorkspaceSettings`, `useWorkspaceSettings`
- `model.ts`: `WorkspaceSettings`

## features/account

- `index.ts`: `AccountTab`, `AppearanceTab`
- `pages.ts`: `TabValue`, `isTabValue`, `WorkspaceSettingsPage`

## features/analytics

- `api.ts`: `AnalyticsRange`, `ProjectAnalytics`, `WorkspaceAnalytics`, `useProjectAnalytics`, `useWorkspaceAnalytics`
- `index.ts`: `AnalyticsSection`, `BarRow`, `ListCard`, `RangeTabs`, `SectionCard`, `StatCard`, `ViewsAreaChart`, `ViewsTimeseriesChart`, `AnalyticsProvider`, `useAnalyticsFilters`
- `pages.ts`: `ProjectAnalyticsRoute`, `WorkspaceAnalyticsRoute`

## features/api-keys

- `api.ts`: `ApiKey`, `ApiKeySecret`, `useCreateApiKey`, `useRevokeApiKey`, `useRotateApiKey`, `useApiKeys`
- `index.ts`: `ApiKeysTab`

## features/auth

- `api.ts`: `InvitationInfo`, `PublicMeta`, `authClient`, `signIn`, `useSession`, `useGetInvitationInfo`, `useGetPublicMeta`
- `index.ts`: `AuthLayout`, `AuthProviders`, `SupportAccessBanner`, `clearPendingInvitation`, `copyToClipboard`, `inviteAcceptUrl`, `readPendingInvitation`, `setPendingInvitation`
- `pages.ts`: `ForgotPasswordPage`, `AcceptInvitePage`, `ResetPasswordPage`, `SignInPage`, `SignUpPage`, `VerifyEmailPage`
- `server.ts`: `getSessionFn`

## features/editor

- `api.ts`: `Comment`, `useAiDraft`, `useCreateComment`, `useDeleteComment`, `useResolveComment`, `useComments`
- `index.ts`: `AiAssist`, `BranchSwitcher`, `CommentsPanel`, `PageSettingsDialog`, `ConfigSectionId`, `ConfigSection`, `ConfigSectionList`, `SortablePageTree`
- `pages.ts`: `EditorPage`

## features/exports

- `index.ts`: `ExportsSection`

## features/git

- `api.ts`: `GitConflict`, `GitOperation`, `GitWorkflowStatus`, `useAuthorizeGitWorkflow`, `useConnectGitWorkflow`, `useDisconnectGitWorkflow`, `useGitWorkflow`, `useQueueGitOperation`, `useResolveGitConflict`, `useRotateGitWorkflowWebhookSecret`, ``, `useImportFromGit`, `useRotateGitWebhookSecret`
- `index.ts`: `GitTab`
- `pages.ts`: `GitPreviewPage`

## features/imports

- `api.ts`: `ContentImportSummary`, `useImportFromGhost`, `useImportFromMintlify`
- `index.ts`: `ImportTab`

## features/integrations

- `api.ts`: `useActivateProjectIntegration`, `useCreateProjectIntegration`, `useDeactivateProjectIntegration`, `useDeleteProjectIntegration`, `useProjectIntegrations`, `useUpdateProjectIntegration`, `useVerifyProjectIntegration`, ``
- `index.ts`: `IntegrationsTab`

## features/languages

- `index.ts`: `AddLanguageDialog`, `LanguageSettingsDialog`

## features/membership

- `api.ts`: `Invitation`, `Member`, `MembersResult`, `useCancelProjectInvitation`, `useInviteMember`, `useInviteProjectMember`, `useRemoveMember`, `useRemoveProjectMember`, `useTransferProjectOwnership`, `useUpdateMemberRole`, `useUpdateProjectMemberRole`, ``, `useMembers`, `useProjectMembers`
- `index.ts`: `MembersSection`, `ProjectAccessBoundary`
- `pages.ts`: `MembersPage`

## features/notifications

- `api.ts`: `NotificationItem`, `NotificationList`, `useMarkNotificationsRead`, `useNotifications`, `useUnreadNotificationCount`
- `index.ts`: `NotificationsPopover`, `NotificationsTab`

## features/project-settings

- `api.ts`: `Domain`, `OpenApiConfiguration`, `ProjectAddon`, `ProjectThemeImportResult`, `useActivateProjectAddon`, `useAddDomain`, `useDeactivateProjectAddon`, `useDeleteDomain`, `useDeleteOpenApi`, `useExportProjectTheme`, `useImportProjectTheme`, `useSetPrimaryDomain`, `useSyncOpenApi`, `useUpdateProjectAddon`, `useUpsertOpenApi`, `useVerifyDomain`, ``, `useCreateProjectSearchReindex`, `useProjectSearchConfiguration`, `useProjectSearchIndexDiagnostics`, `useUpdateProjectSearchConfiguration`, ``, `useDomains`, `useOpenApiConfiguration`, `useProjectAddons`
- `index.ts`: `AddonsSection`, `BannerSection`, `BrandingSection`, `DangerSection`, `DomainSection`, `FooterSection`, `GeneralSection`, `LanguagesSection`, `NavbarSection`, `OpenApiSection`, `RedirectsSection`, `SearchSection`, `SeoSection`, `StylingSection`, `ThemePreview`, `ThemeSection`, `TypographySection`, `VariablesSection`
- `pages.ts`: `SectionId`, `isSectionId`, `ProjectSettingsPage`

## features/projects

- `index.ts`: `NewProjectDialog`
- `pages.ts`: `SiteOverviewPage`, `SitesPage`, `ProjectsPage`

## features/publishing

- `api.ts`: `PendingChanges`, `Deployment`, `DeploymentStatus`, `PendingChange`, `usePublish`, `usePublishAnyway`, `useRollback`, `useDeployments`, `usePendingChanges`
- `index.ts`: `usePublishAnyway`, `useDeployments`, `PublishControl`, `deploymentStatusLabel`, `deploymentStatusVariant`

## features/reader

- `api.ts`: `ChangelogEntry`, `NavNode`, `SearchAnswer`, `SitePage`, `SiteSearchHit`, `SiteShell`, `PublicAnalyticsPayload`, `SiteAnalyticsConsent`, `useCreateSiteAnalyticsEvent`, `useAnswerSite`, `useSiteSearch`
- `appearance.ts`: `projectThemeCss`, `projectThemeStyle`, `projectThemeVariables`, `resolveProjectTheme`, `siteThemeNoFlashScript`, `typographyVars`
- `index.ts`: `SiteAnalyticsProvider`, `DocumentationProjectPreviewLayout`, `DocumentationReaderLayout`, `DocumentationStudioPreviewLayout`, `DocumentationThemeProvider`, ``, `LanguageSwitcher`, `MadeWithBadge`, `Markdown`, `MobileNav`, `SiteLanguageAlternate`, `SitePageAlternatesContext`, `SiteAnalyticsConsent`, `SiteBanner`, `firstLeafPath`, `SiteNav`, `SitePageView`, `SiteSearch`, `VersionSwitcher`
- `links.ts`: `hydratedCustomDomainProjectId`, `rewriteCustomDomainInput`, `rewriteCustomDomainOutput`, `draftPreviewHref`, `ADMIN_URL`, `APP_URL`, `publishedSiteLogo`, `resolveLanguagePathRedirect`, `customDomainOrigin`, `isCustomDomainSite`, `siteHref`, `siteLanguageParam`, `redirectIfConfigured`, `changelogFeedUrl`, `pageHead`, `siteHead`, `sitePageUrl`
- `pages.ts`: `SiteChangelog`, `ProjectPreview`, `SiteHome`, `SiteRoute`, `SitePath`
- `server.ts`: `getGitPreviewFn`, `getSiteFn`, `getSitePageFn`, `listSiteChangelogFn`

## features/reader-access

- `api.ts`: `ReaderAccessData`, `useCreateReaderAudience`, `useDeleteReaderAudience`, `useEmergencyRevokeReaderAccess`, `useInviteReader`, `useReaderAccess`, `useRevokeReader`, `useTestReaderJwt`, `useUpdateReaderAccessMode`, `useUpdateReaderJwt`, ``
- `index.ts`: `AuthenticationSection`

