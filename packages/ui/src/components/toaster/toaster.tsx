'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Toaster as Primitive } from 'sonner';
import { clx } from '@/utils/clx';
import { UiLayer } from '@/utils/layers';

interface ToasterProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive>,
    'richColors' | 'closeButton' | 'icons' | 'theme' | 'invert' | 'loadingIcon' | 'cn' | 'toastOptions'
  > {}

/**
 * This component is based on the [Toaster component of the Sonner library](https://sonner.emilkowal.ski/toaster).
 */
const Toaster = ({
  /**
   * The position of the created toasts.
   */
  position = 'bottom-right',
  /**
   * The gap between the toast components.
   */
  gap = 12,
  /**
   * The space from the edges of the screen.
   */
  offset = 24,
  /**
   * The time in milliseconds that a toast is shown before it's
   * automatically dismissed.
   *
   * @defaultValue 4000
   */
  duration,
  ...props
}: ToasterProps) => {
  const primitiveProps = {
    ...props,
    position,
    gap,
    offset,
    cn: clx,
    toastOptions: {
      duration,
    },
  } as React.ComponentPropsWithoutRef<typeof Primitive>;

  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setContainer(document.body);
  }, []);
  if (!container) return null;

  return createPortal(
    <UiLayer kind="toast" zIndex={props.style?.zIndex}>
      {(layer) => (
        // Notifications are body-portaled live regions, above all modal backdrops.
        // The shared surface controller protects their pointer/focus interactions
        // from outside-dismissal without making background content interactive.
        <div data-ui-toast-root="" style={{ display: 'contents', pointerEvents: 'auto' }}>
          <Primitive {...primitiveProps} style={{ pointerEvents: 'auto', ...props.style, zIndex: layer }} />
        </div>
      )}
    </UiLayer>,
    container,
  );
};

export { Toaster };
