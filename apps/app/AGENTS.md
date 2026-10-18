# App architecture contract

Read the repository-root AGENTS.md and `docs/architecture/05-contributor-guide.md` before editing.

- Preserve the Nibleaf API/auth boundary; this app is not migrated onto Rust CMS services.
- No billing/plans/quotas/pricing/public marketing or SaaS legal-consent gate. Preserve AGPL notices.
- Ownership and allowed feature edges are in `architecture.json`; public interfaces are explicit named exports.
- `app/routes → widgets/features → entities/integrations/shared`. No feature imports app/routes/widgets; shared has no business dependencies.
- Route files register and compose. Feature pages use route APIs, never import route modules.
- Generic UI/controllers belong in shared only with a real reuse/contract justification. Reuse @cms/ui/@cms/editor; no package-wide re-export shims.
- Payloads: RHF + Zod. Remote data: Query. UI prefs: guarded primitive browser preference hook. Do not synchronize form fields in effects or introduce another state framework.
- Endpoints and cache invalidation belong to the owning API module. Generic HTTP receives configuration ports; do not add raw UI fetch or generic service registries.
- No `any`, broad assertions, disabled tests or weakened gates to conceal problems. Root compiler/lint rules are unchanged.
- Verify architecture, lint, format, types, units, build and affected browser/a11y workflows. Record actual results and remaining debt.
- Keep Studio and shared-package source unchanged during app refactors unless explicitly scoped.
