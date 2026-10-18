import { type SubscriberSnippetGeneratorOptions, subscriberSnippetGenerator } from './snippet-generators/subscriber';

export type UseGenerateSnippet = {
  type: 'subscriber';
  options: SubscriberSnippetGeneratorOptions;
};

const generators: Record<string, (options: any) => string> = {
  subscriber: subscriberSnippetGenerator,
};

export const useGenerateSnippet = ({ type, options }: UseGenerateSnippet) => {
  const snippet = generators[type](options);

  return {
    snippet,
  };
};
