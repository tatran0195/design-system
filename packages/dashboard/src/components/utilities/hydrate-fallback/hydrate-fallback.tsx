import { Spinner } from '@cms/icons';
/** Router-neutral loading presentation for host Suspense or loader boundaries. */
export function HydrateFallback() {
  return (
    <div role="status" aria-label="Loading" className="flex min-h-screen items-center justify-center">
      <Spinner aria-hidden className="text-ui-fg-interactive animate-spin" />
    </div>
  );
}
