import clsx from 'clsx';
import type React from 'react';
import ReactMarkdown, { type Components, type Options as ReactMarkdownOptions } from 'react-markdown';
import { MDXComponents } from '@/components/MDXComponents';

export type MarkdownContentProps = ReactMarkdownOptions & {
  className?: string;
  components?: Partial<Components> | null | undefined;
};

export const MarkdownContent = ({ children, className, components, ...props }: MarkdownContentProps) => {
  const content = (
    <ReactMarkdown
      components={
        components || {
          ...MDXComponents,
          pre: ({ className: preClassName, children: preChildren, ...restProps }: React.HTMLAttributes<HTMLPreElement>) => (
            <pre className={clsx('p-0 bg-transparent', preClassName)} {...restProps}>
              {preChildren}
            </pre>
          ),
        }
      }
      {...props}
    >
      {children}
    </ReactMarkdown>
  );

  if (className) {
    return <div className={className}>{content}</div>;
  }

  return content;
};
