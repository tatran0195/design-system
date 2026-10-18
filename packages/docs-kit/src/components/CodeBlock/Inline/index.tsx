import clsx from 'clsx';
import type { CodeBlockProps } from '../../..';

export const CodeBlockInline = ({ source }: CodeBlockProps) => (
  <pre
    className={clsx(
      'px-[6px] bg-cms-tag-neutral-bg',
      'w-full my-docs_0.5 rounded-docs_sm',
      'border border-cms-tag-neutral-border',
      'whitespace-pre-wrap',
    )}
  >
    <code className="w-full text-code-label text-cms-tag-neutral-text">{source}</code>
  </pre>
);
