import type { ComponentLinkFixerOptions } from '@cms/docs-types';
import type { Transformer } from 'unified';
import { componentLinkFixer } from './utils/component-link-fixer.js';

export function typeListLinkFixerPlugin(options?: ComponentLinkFixerOptions): Transformer {
  return componentLinkFixer('TypeList', 'types', options);
}
