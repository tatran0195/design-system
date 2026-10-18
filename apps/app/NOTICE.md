# Third-party source notice

## Nibleaf application and frontend contracts

This application includes modified source from **Nibleaf**:

- Upstream: https://github.com/lord007tn/nibleaf
- Pinned revision: `ca1c9e4545605a5b3ef7bac87b31c1531a3c313a`
- License: **GNU Affero General Public License, version 3 only (AGPL-3.0-only)**
- Full license: `licenses/nibleaf-AGPL-3.0.txt`

Original copyright notices are retained in copied source where supplied. The AGPL applies to the copied and modified application; the CMS name/design adaptation does not relicense Nibleaf’s code as MIT.

Modifications include application/workspace configuration, replacing the Nibleaf design-system layer with primary CMS/public Base UI controls, extracting client-only HTTP/auth contracts, React Hook Form/Zod payload ownership, app-local localization/catalog rendering, CMS branding, explicit fixture tooling, SSR/CSP nonce integration, and removal of billing/public-marketing scope. Source and adapted-file hashes are recorded in `upstream-manifest.json`.

No Nibleaf API/auth/database server implementation is copied into this app. The app remains a client of the existing Nibleaf backend contracts.

## Shared and installed dependencies

`@cms/ui` and `@cms/editor` retain their own notices and license files, including notices for earlier Nibleaf-derived materials. Keep those notices with distributions. Base UI, React, TanStack, Mermaid, Scalar, and other installed dependencies remain subject to their respective licenses and notices; resolved versions/integrity are recorded in the monorepo lockfile. Prebundled dependency caches are generated build artifacts, not relicensed source.

## Network deployment

A modified AGPL application offered to remote users must make the applicable corresponding modified source available under the license. Deployment administrators must supply an appropriate source-access/download mechanism for their actual deployed version. This repository’s source, dependency/build instructions and notices should be retained together.
