import { lazy, Suspense } from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import type { MarkdownProps } from './markdown-types';

export { MarkdownRenderer } from './markdown-renderer';
export type { MarkdownProps, SiteLinkContext } from './markdown-types';

const RichMarkdown = lazy(() => import('./markdown-rich'));

export const needsRichMarkdown = (content: string): boolean => /<\/?[A-Za-z][^>]*>/.test(content) || /(^|[^\\])\$\$?[\s\S]*?\$\$?/m.test(content);

export function Markdown({ content, className, site }: MarkdownProps) {
  if (needsRichMarkdown(content)) {
    return (
      <Suspense fallback={<MarkdownRenderer content={content} className={className} site={site} />}>
        <RichMarkdown content={content} className={className} site={site} />
      </Suspense>
    );
  }
  return <MarkdownRenderer content={content} className={className} site={site} />;
}
