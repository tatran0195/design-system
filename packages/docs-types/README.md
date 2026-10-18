# Documentation Types

`@cms/docs-types` owns shared documentation contracts: configuration, frontmatter,
navigation, sidebars, reference pages, workflow diagrams, Markdown syntax trees
and OpenAPI data.

This package is not the CMS API model package. Keep application API contracts in
their owning client or feature package rather than adding them here.

Consumers import types from `@cms/docs-types`. Build this package before checking
packages that resolve its emitted declarations:

```sh
bun run --cwd packages/docs-types build
bun run --cwd packages/docs-types typecheck
```