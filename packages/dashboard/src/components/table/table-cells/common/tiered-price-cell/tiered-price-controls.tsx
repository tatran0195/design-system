import { ArrowsPointingOut, CircleSliders } from '@cms/icons';
import { clx } from '@cms/ui';
import { useEffect, useRef } from 'react';

export interface TieredPriceControlsProps {
  isTiered: boolean;
  isAnchor: boolean;
  onOpenModal: () => void;
  symbolWidth?: number;
  disabled?: boolean;
}

export const TieredPriceControls = ({ isTiered, isAnchor, onOpenModal, symbolWidth, disabled }: TieredPriceControlsProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !disabled &&
        isAnchor &&
        !e.defaultPrevented &&
        !e.isComposing &&
        !e.repeat &&
        e.target instanceof Node &&
        (buttonRef.current?.closest('[data-grid-cell]') ?? buttonRef.current?.parentElement)?.contains(e.target) &&
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'b'
      ) {
        e.preventDefault();
        buttonRef.current?.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAnchor, disabled]);

  return (
    <div
      className="absolute inset-y-0 z-[3] flex w-fit items-center justify-center"
      style={{
        insetInlineStart: symbolWidth ? `${symbolWidth + 16 + 4}px` : undefined,
      }}
    >
      {isTiered && !isAnchor && (
        <div className="flex size-[15px] items-center justify-center group-hover/container:hidden">
          <CircleSliders className="text-ui-fg-interactive" />
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        aria-label="Open quantity prices"
        disabled={disabled}
        className={clx(
          'hover:text-ui-fg-subtle text-ui-fg-muted transition-fg hidden size-[15px] items-center justify-center rounded-md bg-transparent group-hover/container:flex',
          { flex: isAnchor },
        )}
        onClick={onOpenModal}
      >
        <ArrowsPointingOut />
      </button>
    </div>
  );
};
