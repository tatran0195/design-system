# Third-party notices — @cms/dashboard

## Medusa dashboard extraction

`src` contains code and English message data adapted from the Medusa dashboard, https://github.com/medusajs/medusa, revision **43d729055f73256ce7b3f56d196b1f4e901c011f**, dashboard package **2.21.2**.

**Copyright (c) 2021 Medusajs**

The complete upstream MIT notice, including the enterprise-exception preface present at the pinned revision, is preserved in [`licenses/medusa-MIT.txt`](licenses/medusa-MIT.txt). Retain that notice with copies or substantial portions of the adapted software. The per-file upstream inventory, hashes, targets, consolidation decisions and exclusions are recorded in [`src/upstream-manifest.json`](src/upstream-manifest.json).

The enterprise-licensed `components/common/required-permissions-section/index.ts` and `required-permissions-section.tsx` implementations were **not copied**. Generic authentication/permission presentation components delegate to explicit host decisions; they do not reproduce an enterprise RBAC implementation or confer a commercial license.

Modifications include removing Medusa SDK/router/store/extension coupling, replacing primitive copies with primary CMS UI composition, adding portable host contracts and structural models, consolidating legacy tables, and adding lifecycle, clipboard, accessibility and regression coverage. These adaptations are not an official Medusa product and do not claim drop-in compatibility.

## Existing documentation widgets

The existing documentation-root API is maintained separately from the dashboard entry. Its pre-existing license and dependency notices remain applicable.

## Separately licensed dependencies

The package's own MIT metadata and the Medusa extraction notice do **not** relicense its dependencies. In particular, the primary **`@cms/ui` contains separately noticed Nibleaf-derived AGPL-3.0-only code** alongside MIT code; see `packages/ui/NOTICE.md` and its license files. `@cms/editor` also retains its separate notices from the earlier extraction. Evaluate the obligations of the complete application/distribution; this document does not assert that using the CMS UI dependency makes the whole distribution MIT-only.

Other third-party libraries remain governed by their respective package licenses. No enterprise source license is granted by this extraction.
