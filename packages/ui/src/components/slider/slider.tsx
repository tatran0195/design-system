import type * as React from 'react';
import { clx } from '@/utils/clx';

/**
 * Migrated from the nibleaf design system, restyled with cms `ui-*` tokens.
 *
 * A styled `<input type="range">` slider with a custom (gradient-)paintable
 * rail via the `track` prop. The thumb/track pseudo-elements can't be
 * expressed with Tailwind utilities, so they live in a once-injected scoped
 * `<style>` tag keyed on the `pl-slider` class. This keeps the primitive
 * self-contained.
 */
const SLIDER_CSS = `
.pl-slider{-webkit-appearance:none;appearance:none;background:transparent;}
.pl-slider::-webkit-slider-runnable-track{height:8px;border-radius:9999px;background:var(--pl-track, var(--bg-component-pressed));}
.pl-slider::-moz-range-track{height:8px;border-radius:9999px;background:var(--pl-track, var(--bg-component-pressed));}
.pl-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;margin-top:-5px;border-radius:9999px;background:var(--bg-base);border:2px solid var(--fg-muted);box-shadow:0 1px 2px rgba(0,0,0,.18);cursor:pointer;}
.pl-slider::-moz-range-thumb{width:18px;height:18px;border-radius:9999px;background:var(--bg-base);border:2px solid var(--fg-muted);box-shadow:0 1px 2px rgba(0,0,0,.18);cursor:pointer;}
`;

function SliderStyles() {
  // React 19 hoists + dedupes <style> by `href`, so multiple sliders share one tag.
  return (
    <style href="pl-slider" precedence="default">
      {SLIDER_CSS}
    </style>
  );
}

function Slider({ className, track, style, ...props }: Omit<React.ComponentProps<'input'>, 'type'> & { track?: string }) {
  return (
    <>
      <SliderStyles />
      <input
        type="range"
        data-slot="slider"
        className={clx(
          'pl-slider h-6 w-full cursor-pointer rounded-full outline-none focus-visible:shadow-borders-interactive-with-focus disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        style={{ ...(track ? ({ '--pl-track': track } as React.CSSProperties) : {}), ...style }}
        {...props}
      />
    </>
  );
}

export { Slider };
