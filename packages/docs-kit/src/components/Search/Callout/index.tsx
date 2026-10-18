'use client';

import { useInstantSearch } from 'react-instantsearch';
import { DocsTrackingEvents } from '../../../constants';
import { useCMSSuggestions } from '../../../hooks/use-cms-suggestions';
import { useAnalytics } from '../../../providers/Analytics';
import { Card } from '../../Card';

export const SearchCallout = () => {
  const { results } = useInstantSearch();
  const query = results?.query || '';
  const matchedCallout = useCMSSuggestions({ keywords: query });
  const { track } = useAnalytics();

  if (!matchedCallout) {
    return null;
  }

  return (
    <div className="m-docs_1 flex justify-center items-center">
      <Card
        {...matchedCallout}
        type="bloom"
        onClick={() => {
          track({
            event: {
              event: DocsTrackingEvents.SEARCH_CALLOUT_CLICK,
              options: {
                user_keywords: query,
                callout_title: matchedCallout.title,
                callout_href: matchedCallout.href,
              },
            },
          });
        }}
      />
    </div>
  );
};
