import type { FrontMatter } from '@cms/docs-types';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { read, readSync } from 'to-vfile';
import { unified } from 'unified';
import { matter } from 'vfile-matter';

export async function getFrontMatter(filePath: string): Promise<FrontMatter> {
  return (
    await unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ['yaml'])
      .use(() => (_tree, file) => {
        matter(file);
      })
      .process(await read(filePath))
  ).data.matter as FrontMatter;
}

export function getFrontMatterSync(filePath: string): FrontMatter {
  const content = readSync(filePath);

  matter(content);

  return content.data.matter as FrontMatter;
}

export async function getFrontMatterFromString(fileContent: string): Promise<FrontMatter> {
  return (
    await unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ['yaml'])
      .use(() => (_tree, file) => {
        matter(file);
      })
      .process(fileContent)
  ).data.matter as FrontMatter;
}
