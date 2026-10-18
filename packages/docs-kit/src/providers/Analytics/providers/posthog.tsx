import posthog from 'posthog-js';
import type { TrackedEvent } from '..';

export const usePostHogAnalytics = () => {
  const track = async ({ event, options }: TrackedEvent) => {
    posthog.capture(event, options);
  };

  return {
    track,
  };
};
