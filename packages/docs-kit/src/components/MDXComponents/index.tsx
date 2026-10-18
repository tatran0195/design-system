import { Text } from '@cms/ui';
import clsx from 'clsx';
import type { Components } from 'react-markdown';

export type MDXComponentsType = Components & Record<string, any>;

import type React from 'react';
import { Card } from '@/components/Card';
import { CardList } from '@/components/CardList';
import { CodeMdx } from '@/components/CodeMdx';
import { Details, type DetailsProps } from '@/components/Details';
import { DetailsSummary } from '@/components/Details/Summary';
import { H1 } from '@/components/Heading/H1';
import { H2 } from '@/components/Heading/H2';
import { H3 } from '@/components/Heading/H3';
import { H4 } from '@/components/Heading/H4';
import { Kbd } from '@/components/Kbd';
import { Link } from '@/components/Link';
import { Note } from '@/components/Note';
import { ZoomImg } from '@/components/ZoomImg';

export const MDXComponents: MDXComponentsType = {
  code: CodeMdx,
  kbd: Kbd,
  Kbd,
  // Referenced through a wrapper (read at render time, not module-init time) to
  // break a circular-import TDZ: Note -> Note/Layout -> MarkdownContent ->
  // MDXComponents -> Note. Without this, importing `Note` before this module is
  // initialized throws "Cannot access 'Note' before initialization".
  Note: (props: React.ComponentProps<typeof Note>) => <Note {...props} />,
  details: Details,
  Details: ({ className, ...props }: DetailsProps) => <Details {...props} className={clsx(className, 'my-docs_1')} />,
  Summary: DetailsSummary,
  Card: (props: React.ComponentProps<typeof Card>) => <Card {...props} />,
  CardList: (props: React.ComponentProps<typeof CardList>) => <CardList {...props} />,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={clsx('text-cms-fg-base [&:not(:last-child)]:mb-docs_1.5 last:!mb-0', className)} {...props} />
  ),
  ul: ({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className={clsx('list-disc px-docs_1 mb-docs_1.5 [&_ul]:mb-0 [&_ol]:mb-0 [&_p]:!mb-0', className)}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className={clsx('list-decimal px-docs_1 mb-docs_1.5 [&_ul]:mb-0 [&_ol]:mb-0 [&_p]:!mb-0', className)}>
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <li className={clsx('text-cms-fg-base [&:not(:last-child)]:mb-docs_0.5', '[&_ol]:mt-docs_0.5 [&_ul]:mt-docs_0.5', className)} {...props}>
      <Text as="span">{children}</Text>
    </li>
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className={clsx('my-docs_2 h-[1px] w-full border-0 bg-cms-border-base', className)} {...props} />
  ),
  img: (props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    // NOTE: don't destructure `key` here — React 19 strips it from props and
    // warns when it's accessed ("key is not a prop").
    return <ZoomImg {...props} />;
  },
  a: (props: any) => <Link {...props} variant="content" />,
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => <strong className={clsx('txt-medium-plus', className)} {...props} />,
};

export const Hr = MDXComponents.hr as () => React.JSX.Element;
