import type { Transformer } from 'unified';

export function remarkAttachFrontmatterDataPlugin(): Transformer {
  return async (_tree, file) => {
    const { matter } = await import('vfile-matter');

    matter(file);
  };
}
