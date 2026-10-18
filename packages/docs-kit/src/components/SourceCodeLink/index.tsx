import clsx from 'clsx';
import type React from 'react';
import { Badge } from '../Badge';
import { GithubIcon } from '../Icons/Github';
import { Link } from '../Link';

type SourceCodeLinkProps = {
  link: string;
  text?: string;
  icon?: React.ReactNode;
  className?: string;
};

export const SourceCodeLink = ({ link, text, icon, className }: SourceCodeLinkProps) => (
  <Link href={link} target="_blank" rel="noreferrer" className={clsx('my-docs_0.5 align-middle inline-block', className)}>
    <Badge
      variant="neutral"
      className="inline-flex hover:bg-cms-tag-neutral-bg-hover cursor-pointer"
      childrenWrapperClassName="inline-flex flex-row gap-[3px] items-center"
    >
      {icon || <GithubIcon />}
      <span>{text || 'Source Code'}</span>
    </Badge>
  </Link>
);
