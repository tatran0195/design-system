import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Input } from '@/shared/ui/input';
import { Field } from '@/shared/ui/settings-controls';
import { Slider } from '@/shared/ui/slider';
import { Textarea } from '@/shared/ui/textarea';

describe('Field', () => {
  it('associates its visible label with a direct input control', () => {
    const markup = renderToStaticMarkup(
      <Field hint="Where readers land" label="Destination">
        <Input defaultValue="https://example.com" />
      </Field>,
    );

    const htmlFor = markup.match(/<label[^>]*for="([^"]+)"/)?.[1];
    expect(htmlFor).toBeTruthy();
    expect(markup).toMatch(new RegExp(`<input[^>]*id="${htmlFor}"`));
  });

  it('associates its visible label with a direct textarea control', () => {
    const markup = renderToStaticMarkup(
      <Field label="Description">
        <Textarea defaultValue="A useful description" />
      </Field>,
    );

    const htmlFor = markup.match(/<label[^>]*for="([^"]+)"/)?.[1];
    expect(htmlFor).toBeTruthy();
    expect(markup).toMatch(new RegExp(`<textarea[^>]*id="${htmlFor}"`));
  });

  it('associates its visible label with a direct slider control', () => {
    const markup = renderToStaticMarkup(
      <Field label="Reading size">
        <Slider defaultValue={16} max={20} min={12} />
      </Field>,
    );

    const htmlFor = markup.match(/<label[^>]*for="([^"]+)"/)?.[1];
    expect(htmlFor).toBeTruthy();
    expect(markup).toMatch(new RegExp(`<input[^>]*type="range"[^>]*id="${htmlFor}"`));
  });
});
