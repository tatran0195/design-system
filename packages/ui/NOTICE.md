# Source and license notices

The pre-existing cms UI components retain their original MIT license. The
CMS theme stylesheet and token data formerly maintained in `@cms/ui-preset`
are now included here and retain their original MIT license. This
package also incorporates components and hooks ported from
[Nibleaf](https://github.com/lord007tn/nibleaf), whose design-system package is
licensed **AGPL-3.0-only**. The merged package is not an MIT-only distribution.

Nibleaf-derived additions include Accordion, Breadcrumb, Card, Chart,
Collapsible, Direction, FieldError, InputGroup, Progress, ScrollArea,
SegmentedControl, Sidebar (including its internal sheet), Slider,
ThemeProvider, and the mobile/OTP countdown hooks. Button additions were
adapted to the existing cms component; its original variants remain intact.

The upstream AGPL license is included in `licenses/AGPL-3.0-only.txt`.
The package metadata records the original MIT code and AGPL-licensed additions
as `(MIT AND AGPL-3.0-only)`. Preserve these notices when redistributing.

Port/adaptation date: 2026-10-15. Upstream source revision:
`ca1c9e4545605a5b3ef7bac87b31c1531a3c313a`.
