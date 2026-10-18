import { StartClient } from '@tanstack/react-start/client';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
    {
      onRecoverableError(error, info) {
        // Keep recoverable SSR failures observable, including their component
        // location; never hide a hydration failure in the design preview.
        console.error('CMS hydration recovery', info.componentStack, error);
        if (typeof reportError === 'function') reportError(error);
      },
    },
  );
});
