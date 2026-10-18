'use client';

import { useChat } from '@kapaai/react-sdk';
import clsx from 'clsx';
import { DocsTrackingEvents } from '../../../../constants';
import { useCMSSuggestions } from '../../../../hooks/use-cms-suggestions';
import { useAiAssistant } from '../../../../providers/AiAssistant';
import { useAnalytics } from '../../../../providers/Analytics';
import { Card } from '../../../Card';

type AiAssistantChatWindowCalloutProps = {
  className?: string;
};

export const AiAssistantChatWindowCallout = ({ className }: AiAssistantChatWindowCalloutProps) => {
  const { conversation } = useChat();
  const { loading } = useAiAssistant();
  const { track } = useAnalytics();

  const lastQuestion = conversation.getLatestCompleted()?.question;

  const matchedCallout = useCMSSuggestions({
    keywords: lastQuestion || '',
  });

  if (loading || !matchedCallout) {
    return null;
  }

  return (
    <div className={clsx('px-docs_1 pt-docs_1', className)}>
      <div className="flex justify-center items-center">
        <Card
          {...matchedCallout}
          type="bloom"
          onClick={() => {
            track({
              event: {
                event: DocsTrackingEvents.AI_ASSISTANT_CALLOUT_CLICK,
                options: {
                  user_keywords: lastQuestion || '',
                  callout_title: matchedCallout.title || '',
                  callout_href: matchedCallout.href || '',
                },
              },
            });
          }}
        />
      </div>
    </div>
  );
};
