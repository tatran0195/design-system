import type { UnistNode, UnistTree } from '@cms/docs-types';
import type { Transformer } from 'unified';

type Options = {
  url: string;
};

export function addUrlToRelativeLink(options: Options): Transformer {
  return async (tree) => {
    const { visit } = await import('unist-util-visit');

    visit(tree as UnistTree, 'link', (node: UnistNode) => {
      if (!node.url?.startsWith('/')) {
        return;
      }

      node.url = `${options.url}${node.url}`;
    });
  };
}
