'use client';

import { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useUiLayer } from '@/utils/layers';
import { RenderPrompt, type RenderPromptProps } from './render-prompt';

type UsePromptProps = Omit<RenderPromptProps, 'onConfirm' | 'onCancel' | 'open' | 'layer'>;

const usePrompt = () => {
  // The imperative React root does not inherit the caller's portal context.
  const layer = useUiLayer('prompt');
  const currentPromptPromise = useRef<Promise<boolean> | null>(null);

  const prompt = async (props: UsePromptProps): Promise<boolean> => {
    if (currentPromptPromise.current) {
      return currentPromptPromise.current;
    }

    const promptPromise = new Promise<boolean>((resolve) => {
      let open = true;
      const mountRoot = createRoot(document.createElement('div'));

      const onCancel = () => {
        open = false;
        mountRoot.unmount();
        resolve(false);
        currentPromptPromise.current = null;
      };

      const onConfirm = () => {
        open = false;
        resolve(true);
        mountRoot.unmount();
        currentPromptPromise.current = null;
      };

      const render = () => {
        mountRoot.render(<RenderPrompt open={open} onConfirm={onConfirm} onCancel={onCancel} {...props} layer={layer} />);
      };

      render();
    });

    currentPromptPromise.current = promptPromise;
    return promptPromise;
  };

  return prompt;
};

export { usePrompt };
