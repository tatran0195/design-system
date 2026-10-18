'use client';

import { CheckCircle, SquareTwoStack } from '@cms/icons';
import { CopyButton } from '@/components/CopyButton';
import { type UseGenerateSnippet, useGenerateSnippet } from '@/hooks/use-generate-snippet';

export type CopyGeneratedSnippetButtonProps = UseGenerateSnippet & {
  tooltipText?: string;
};

export const CopyGeneratedSnippetButton = ({ tooltipText, ...props }: CopyGeneratedSnippetButtonProps) => {
  const { snippet } = useGenerateSnippet(props);

  return (
    <CopyButton text={snippet} tooltipText={tooltipText} className="inline-block w-fit">
      {({ isCopied }) => {
        if (isCopied) {
          return <CheckCircle />;
        }
        return <SquareTwoStack />;
      }}
    </CopyButton>
  );
};
