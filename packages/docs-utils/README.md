# Documentation Utilities

`@cms/docs-utils` owns documentation processing utilities, including frontmatter,
Markdown conversion, syntax-tree parsing, sidebars and document search helpers.
Shared contracts belong to `@cms/docs-types`; reader UI belongs to `@cms/docs-kit`;
application dashboard components belong to `@cms/dashboard`.

The `@cms/docs-utils/global-config` entry is separate from the general utilities.
Build the documentation contracts before checking this package:

```sh
bun run --cwd packages/docs-types build
bun run --cwd packages/docs-utils typecheck
bun run --cwd packages/docs-utils test --run
```