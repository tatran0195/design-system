import type { ComponentLinkFixerOptions } from '@cms/docs-types';
import type { Transformer } from 'unified';
import { componentLinkFixer } from './utils/component-link-fixer.js';

export function prerequisitesLinkFixerPlugin(options?: ComponentLinkFixerOptions): Transformer {
  return componentLinkFixer('Prerequisites', 'items', options);
}
