import type { UnistNode, UnistTree } from '@cms/docs-types';
import type { Transformer } from 'unified';

export const changeLinksToHtmlMdPlugin = (): Transformer => async (tree) => {
  const { visit } = await import('unist-util-visit');

  visit(tree as UnistTree, ['link'], (node: UnistNode) => {
    if (
      node.type === 'link' &&
      node.url?.startsWith('https://docs.cms.com') &&
      !node.url.endsWith('index.html.md') &&
      !node.url.includes('/api/store') &&
      !node.url.includes('/api/admin')
    ) {
      node.url += '/index.html.md';
    }
  });
};
