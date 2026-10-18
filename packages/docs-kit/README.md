# Documentation Reader Kit

`@cms/docs-kit` owns documentation reader components, providers and browser
integrations. It does not export the application dashboard.

## Package Ownership

| Package | Responsibility |
| --- | --- |
| `@cms/docs-kit` | Documentation reader UI and browser integrations |
| `@cms/docs-utils` | Documentation processing, Markdown, syntax trees and sidebar utilities |
| `@cms/docs-types` | Shared documentation contracts, not application API models |
| `@cms/dashboard` | Application dashboard components, forms, tables and host adapters |
| `@cms/ui` | Shared UI primitives and design tokens |

Import dashboard components from `@cms/dashboard`, not the removed
`@cms/docs-kit/dashboard` entry. Shared documentation types are imported from
`@cms/docs-types`, replacing `@cms/types`.

Some reader-local type adapters remain intentionally distinct from the shared
contracts because their frontmatter, config and OpenAPI shapes differ.

Build dependencies before validating this package:

```sh
bun run --cwd packages/docs-types build
bun run --cwd packages/docs-utils build
bun run --cwd packages/docs-kit typecheck
bun run --cwd packages/docs-kit build
```