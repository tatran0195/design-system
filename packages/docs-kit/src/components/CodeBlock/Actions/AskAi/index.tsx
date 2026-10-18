'use client';

import { useChat } from '@kapaai/react-sdk';
import clsx from 'clsx';
import { useAiAssistant } from '../../../../providers/AiAssistant';
import { useSiteConfig } from '../../../../providers/SiteConfig';
import { BloomIcon } from '../../../Icons';
import { Tooltip } from '../../../Tooltip';

export type CodeBlockCopyActionProps = {
  source: string;
  inHeader: boolean;
};

export const CodeBlockAskAiAction = ({ source, inHeader }: CodeBlockCopyActionProps) => {
  const { setChatOpened, loading } = useAiAssistant();
  const { config } = useSiteConfig();
  const { submitQuery } = useChat();

  if (!config.features?.aiAssistant) {
    return null;
  }

  const handleClick = () => {
    if (loading) {
      return;
    }
    submitQuery(`\`\`\`tsx\n${source.trim()}\n\`\`\`\n\nExplain the code above`);
    setChatOpened(true);
  };

  return (
    <Tooltip
      text="Ask Bloom"
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
