# CMS application

Nibleaf’s application copied into **`apps/app`** and adapted to the primary CMS design system. **`apps/studio` is a separate application and is not replaced.**

This is a **design-only port**. Application routes, the editor/drafts/publishing flows, published-documentation routes, and Nibleaf’s HTTP and Better Auth contracts are retained. This app does **not** connect to the Rust CMS services or copy a Nibleaf database/auth/API server.

## Run with your Nibleaf backend

Requirements: Node.js 24+, Bun 1.4+, and approximately 4 GB of build memory (RAM plus swap). Run from the monorepo root:

```sh
bun install
NIBLEAF_API_URL=http://127.0.0.1:4311 bun run --cwd apps/app dev
```

The app listens on **0.0.0.0:4310**. Its development server accepts the Arena `.e2b.app` preview hosts. Browser API and auth requests use the **current origin**; the app server proxies `/api/**` to the backend. Do not put a sandbox-only localhost address in browser-facing code.

Set `NIBLEAF_API_URL` (or the fallback `VITE_API_URL`) when building/developing against a different backend. For production, set `VITE_APP_URL` to the public app origin at build time and keep runtime `APP_URL` / `PORT` consistent; localhost:4310 is the local default. Configure that backend’s Better Auth trusted origins, organization/admin/email-OTP plugins, email delivery, and storage/provider credentials as usual. Frontend startup does not provision those services.

```sh
bun run --cwd apps/app generate-routes
bun run --cwd apps/app typecheck
bun run --cwd apps/app test
bun run --cwd apps/app test:browser
bun run --cwd apps/app build
bun run --cwd apps/app start
```

The runner uses Vite’s **multi-environment builder** so `build` produces the client, Start SSR, and Nitro server, not just a client bundle. Missing `@cms/ui` / `@cms/editor` distribution files are built automatically. Production output is `.output/`.

## Isolated design preview

```sh
bun run --cwd apps/app dev:design
```

This explicitly starts an **in-memory fixture API** on internal port **4391**, builds a separate `design` artifact in `.cache/design-output/`, and serves it on **4310**. The fixture session switch is an explicit POST action (not a side effect of link prefetching). An on-screen notice distinguishes this mode from a real workspace. The fixture process refuses to start if its API port is occupied. Browser checks explicitly reset only these marked, in-memory fixtures before each case.

- No real credentials, database, outbound API requests, or persistent mutations.
- The normal app still calls its ordinary API/auth endpoints. No production authentication bypass is installed.
- The fixture sign-in screen accepts a six-digit demo code (for example `123456`); no email is sent.
- The “Sign-in screen” action switches the single-user fixture session to signed out. Signing in switches it back.
- Sample projects, editing and common settings demonstrate UI interactions. Unsupported service endpoints return an explicit fixture error; real deployment, Git, AI, mail and storage integration require the real backend.
- Preview-only iframe permission requires the explicit `CMS_DESIGN_PREVIEW` flag. Normal production retains its frame policy and nonce-based CSP.

Never expose this fixture mode as a production service. A browser/fixture check is not a live-backend integration certification.

## Feature architecture

Read [the architecture audit](docs/architecture/01-audit.md), [target and dependency rules](docs/architecture/02-target-and-rules.md), [roadmap](docs/architecture/03-roadmap.md), [reuse catalog](docs/architecture/04-reuse-catalog.md), [contributor guide](docs/architecture/05-contributor-guide.md), and [current module APIs](docs/architecture/06-module-catalog.md). Machine-enforced ownership is in `architecture.json`; run `check:architecture`, `lint`, and `format:check` before contributing. No new workspace packages were created.

## Design and architectural boundaries

- Primary **`@cms/ui`**, its semantic theme/control-text/layer CSS, and public **Base UI** primitives supply controls and interaction ownership.
- Small app-local adapters retain the copied component calling conventions. Command/search uses public Base UI Autocomplete, not cmdk; Select/Dialog use public Base UI/CMS primitives. No Radix imports or compatibility packages are introduced.
- Editable payloads are owned by **React Hook Form + Zod**. `shared/forms/use-field-form` is the deliberate RHF compound field/render presentation; `use-payload-form` provides controlled payload editors and explicit submit validation. Neither uses TanStack Form. Editor document hydration retains the existing record/draft conflict protection while resetting the RHF document payload.
- Same paths/methods, encoded path parameters, repeated query parameters, JSON/FormData, cookies and **`x-nibleaf-locale`** are preserved by `integrations/nibleaf/transport.ts`. Client DTOs and validators stay in the app; no backend workspace types are imported.
- Nibleaf’s **12 interface languages**, including Arabic/Urdu RTL, stay app-local in `src/shared/i18n` and `i18n/messages`. The app build aliases the shared editor’s localization entry to this same provider, without changing CMS’s shared localization package or Studio. The pinned catalogs are flat strings with named interpolation, validated before builds/tests.
- Mermaid/Scalar and localization are prebundled into the disposable `.cache/` directory to reduce the native build graph. React remains external to those vendor bundles. No feature/language is sampled out. Shared editor typography and the scoped published-documentation theme/typesetting contract are imported explicitly. Query restoration holds requests during the initial streamed hydration pass so fast sibling queries cannot race server-rendered placeholders.
- Public marketing/blog/guide/comparison pages, legal-consent checkboxes, billing/plan/usage surfaces, quotas/upgrade enforcement, and first-publish marketing attribution are excluded. User documentation, editor onboarding, reader access and genuine deployment tracking are retained. Unused wire DTO/catalog keys are not feature implementations.

## License and provenance

The copied/modified application is **AGPL-3.0-only**, pinned to Nibleaf revision **`ca1c9e4545605a5b3ef7bac87b31c1531a3c313a`**. See `NOTICE.md`, `licenses/nibleaf-AGPL-3.0.txt`, and `upstream-manifest.json` for provenance and adaptation/exclusion records.

When offering the modified application over a network, provide users the corresponding modified source under the AGPL’s applicable terms. This includes the app and the shared source/build material needed for that version; an unmodified upstream link alone is not the modified source offer. Configure your deployment’s source-access mechanism accordingly.

Browser checks use Playwright Chromium and refuse to run against an API without the explicit fixture marker. Install the browser with `bunx playwright install chromium` (and platform dependencies when required). `CMS_REUSE_DESIGN_PREVIEW=true bun run --cwd apps/app test:browser` reuses an already-running design preview.

## Verification — 2026-10-16

The current refactor results, before/after evidence and known limits are in [the architecture verification report](docs/architecture/08-verification.md).

| Check | Result |
| --- | --- |
| App TypeScript | Passed (serial checker) |
| Production client + Start SSR + Nitro build | Passed; `.output/server/index.mjs` generated |
| Application unit tests | **416 passed, 67 files** |
| Chromium fixture checks | **8 passed** |
| Shared `@cms/ui` tests / types | **128 passed**, types passed |
| Shared `@cms/editor` tests / types | **96 passed**, types passed |
| Isolated dashboard search regression | **8 passed** |
| Frozen lockfile installation | Passed |
| Studio starting-state comparison | **56 files unchanged** |

Chromium checks exercise clean hydration/CSP, keyboard command navigation, editor typography, autosave request/response behavior, modal focus/layers, dark mode and Arabic persistence, reader typography, mobile overflow/sidebar dismissal, internal signup scope, and ordinary email/OTP authentication through the fixture API.

Production still emits advisory large-chunk warnings for retained editor/icon/Mermaid/Scalar material. This port does not claim a passed bundle-size budget. **Live Nibleaf mail, Git, AI, storage and deployment services were not exercised without their backend/configuration.**

Current local-fixture screenshots are under `docs/preview-dashboard.png`, `docs/preview-editor.png`, `docs/preview-reader.png`, and `docs/preview-sign-in.png`.

Run `bun run --cwd apps/app audit --check-studio` to verify the recorded source boundaries and starting Studio hashes. After an intentional app adaptation, `audit --refresh` refreshes target/authored hashes while retaining the pinned upstream source hashes.
