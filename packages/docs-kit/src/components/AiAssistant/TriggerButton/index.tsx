'use client';

import { useKeyboardShortcut } from '../../../hooks';
import { useAiAssistant } from '../../../providers/AiAssistant';
import { useSearch } from '../../../providers/Search';
import { getOsShortcut } from '../../../utils/os-browser-utils';
import { Button } from '../../Button';
import { BloomIcon } from '../../Icons';
import { Kbd } from '../../Kbd';
import { Tooltip } from '../../Tooltip';

export const AiAssistantTriggerButton = () => {
  const { setChatOpened } = useAiAssistant();
  const { setIsOpen } = useSearch();
  const osShortcut = getOsShortcut();

  useKeyboardShortcut({
    metakey: true,
    shortcutKeys: ['i'],
    action: () => {
      setChatOpened((prev) => !prev);
      setIsOpen(false);
    },
    checkEditing: false,
  });

  return (
    <Tooltip
      render={() => (
        <span className="flex gap-[5px] items-center">
          <Kbd className="bg-cms-bg-field-component border-cms-border-strong w-[18px] h-[18px] inline-block">{osShortcut}</Kbd>
          <Kbd className="bg-cms-bg-field-component border-cms-border-strong w-[18px] h-[18px] inline-block">i</Kbd>
        </span>
      )}
    >
      <Button variant="transparent-clear" onClick={() => setChatOpened((prev) => !prev)}>
        <BloomIcon className="text-cms-fg-subtle" />
        <span className="hidden md:inline-block text-cms-fg-subtle">Ask Bloom</span>
      </Button>
    </Tooltip>
  );
};
