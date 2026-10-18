'use client';

import { CheckMini, SquareTwoStack } from '@cms/icons';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { DocsTrackingEvents } from '../../../../constants';
import { useAnalytics } from '../../../../providers/Analytics';
import { CopyButton } from '../../../CopyButton';
import type { CodeBlockStyle } from '../..';

export type CodeBlockCopyActionProps = {
  source: string;
  inHeader: boolean;
  codeBlockStyle?: CodeBlockStyle;
};

export const CodeBlockCopyAction = ({ source, inHeader, codeBlockStyle = 'loud' }: CodeBlockCopyActionProps) => {
  const [copied, setCopied] = useState(false);
  const { track } = useAnalytics();

  useEffect(() => {
    if (!copied) {
      return;
    }

    setTimeout(() => {
      setCopied(false);
    }, 1000);

    track({
      event: {
        event: DocsTrackingEvents.CODE_BLOCK_COPY,
        options: {
          text: source.substring(0, 150),
        },
      },
    });
  }, [copied, track, source.substring]);

  const iconClassName = useMemo(() => {
    if (codeBlockStyle === 'loud') {
      return ['text-cms-contrast-fg-secondary', 'group-hover:text-cms-contrast-fg-primary', 'group-focus:text-cms-contrast-fg-primary'];
    }

    return ['text-cms-fg-muted', 'group-hover:text-cms-fg-subtle', 'group-focus:text-cms-fg-subtle'];
  }, [codeBlockStyle]);

  return (
    <CopyButton
      text={source}
      tooltipClassName="font-base"
      className={clsx('group')}
      buttonClassName={clsx(!inHeader && 'p-[6px]', inHeader && 'p-[4.5px]')}
      tooltipInnerClassName={clsx(
        inHeader && 'flex',
        'h-fit rounded-docs_sm',
        codeBlockStyle === 'loud' && 'group-hover:bg-cms-contrast-bg-base-hover group-focus:bg-cms-contrast-bg-base-hover',
        codeBlockStyle === 'subtle' && 'group-hover:bg-cms-bg-component group-focus:bg-cms-bg-component',
      )}
      onCopy={() => setCopied(true)}
    >
      {!copied && <SquareTwoStack className={clsx(iconClassName)} data-testid="not-copied-icon" />}
      {copied && <CheckMini className={clsx(iconClassName)} data-testid="copied-icon" />}
    </CopyButton>
  );
};
