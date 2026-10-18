'use client';

import clsx from 'clsx';
import { DocsTrackingEvents } from '../../../../constants';
import { useAnalytics } from '../../../../providers/Analytics';
import { BloomIcon } from '../../../Icons';
import { Tooltip } from '../../../Tooltip';

export type CodeBlockBloomActionProps = {
  source: string;
  inHeader: boolean;
};

export const CodeBlockBloomAction = ({ source, inHeader }: CodeBlockBloomActionProps) => {
  const { track } = useAnalytics();

  const handleClick = () => {
    window.parent.postMessage(
      {
        type: 'MEDUSA_AI_SEND_PROMPT',
        data: {
          prompt: source.trim(),
        },
      },
      '*',
    );
    track({
      event: {
        event: DocsTrackingEvents.BLOOM_ACTION,
        options: {
          type: 'send_to_bloom',
          code: source.trim(),
        },
      },
    });
  };

  return (
    <Tooltip
      text="Send to Bloom"
      tooltipClassName="font-base"
      className={clsx('group')}
      innerClassName={clsx(
        inHeader && 'flex',
        'h-fit rounded-docs_sm',
        'group-hover:bg-cms-contrast-bg-base-hover group-focus:bg-cms-contrast-bg-base-hover',
      )}
    >
      <span
        className={clsx(
          !inHeader && 'p-[6px]',
          inHeader && 'p-[4.5px]',
          'cursor-pointer',
          'text-cms-contrast-fg-secondary group-hover:text-cms-contrast-fg-primary',
          'group-focus:text-cms-contrast-fg-primary',
        )}
        onClick={handleClick}
      >
        <BloomIcon />
      </span>
    </Tooltip>
  );
};
