import { useCallback, useEffect, useRef } from 'react';
import { useT } from '@/shared/i18n/react';
import { useConfirm } from '@/shared/ui/confirm';
import { GroupLabel, Segmented } from '@/shared/ui/settings-controls';

/**
 * Shared building blocks for the Site-configurations sections. Each section file
 * composes these to stay consistent with the design (section header rule, a
 * label + helper-text field wrapper, segmented controls and toggle rows).
 */

/** The header at the top of every section pane: a muted glyph + the title, with
 *  an optional one-line description under it. */

/** A labelled form row: bold label, muted helper text, then the control. */

/**
 * A standalone bold group label (e.g. "Navbar links", "Primary color") that
 * heads a control group rather than labelling a single input. Rendered as a
 * non-`<label>` element so it isn't expected to associate with one control.
 */

/** A pill segmented control matching the chip-background design tokens. */

/** A bordered toggle row: title + helper text on the left, a Switch on the right. */

/**
 * Canonical ordering for every language list in the settings surfaces:
 * the default language first, then the configured position.
 */
export function sortLanguagesDefaultFirst<T extends { isDefault: boolean; position: number }>(languages: T[]): T[] {
  return [...languages].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0) || a.position - b.position);
}

/** A language's display label; disabled languages carry the muted "hidden"
 *  suffix so pickers always signal that the scope isn't live on the site. The
 *  label is the language's own name, so it renders in that language's
 *  direction when known (keeps "Português (Brasil)" intact in an RTL UI). */
export function LanguageOptionLabel({ language }: { language: { label: string; enabled?: boolean; direction?: 'LTR' | 'RTL' } }) {
  const t = useT();
  const dir = language.direction ? (language.direction === 'RTL' ? 'rtl' : 'ltr') : undefined;
  if (language.enabled !== false) {
    return <span dir={dir}>{language.label}</span>;
  }
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span dir={dir}>{language.label}</span>
      <span className="font-normal text-[10px] text-muted-foreground/80 uppercase tracking-wide">{t('settings.languages.hiddenBadge')}</span>
    </span>
  );
}

/**
 * "Default + one per extra language" scope switcher used by the scoped sections
 * (navbar/footer/banner/search/seo): the default scope edits `project.config`,
 * a language scope edits that language's `config.<section>` override. EVERY
 * non-default language is listed — disabled languages stay editable (matching
 * the Languages section's promise) but carry a muted "hidden" suffix since that
 * scope isn't live on the published site. Renders nothing when the site has no
 * extra languages. The optional async `guard` runs before a scope switch (the
 * sections use it for an unsaved-changes confirm) — the switch only applies
 * when it resolves true.
 */
export function LanguageScopePicker({
  languages,
  defaultLanguage,
  value,
  onChange,
  hint,
  guard,
}: {
  languages: Array<{ id: string; label: string; enabled?: boolean }>;
  /** The site's default language — its label annotates the Default segment so
   *  it's clear which language the global scope actually is. */
  defaultLanguage?: { label: string; direction?: 'LTR' | 'RTL' } | null;
  value: string;
  onChange: (value: string) => void;
  hint: string;
  guard?: () => boolean | Promise<boolean>;
}) {
  const t = useT();
  if (languages.length === 0) {
    return null;
  }
  const handleChange = async (next: string) => {
    if (next === value) {
      return;
    }
    if (guard && !(await guard())) {
      return;
    }
    onChange(next);
  };
  return (
    <div className="mb-6">
      <GroupLabel>{t('settings.chrome.scope.label')}</GroupLabel>
      <p className="mt-1 mb-2.5 text-[12.5px] text-muted-foreground leading-snug">{hint}</p>
      <Segmented
        onChange={(next) => void handleChange(next)}
        options={[
          {
            value: 'default',
            label: defaultLanguage ? (
              <span className="inline-flex items-baseline gap-1.5">
                {t('settings.chrome.scope.default')}
                <span className="font-normal text-[12px] text-muted-foreground">
                  ·{' '}
                  <span dir={defaultLanguage.direction ? (defaultLanguage.direction === 'RTL' ? 'rtl' : 'ltr') : undefined}>
                    {defaultLanguage.label}
                  </span>
                </span>
              </span>
            ) : (
              t('settings.chrome.scope.default')
            ),
          },
          ...languages.map((language) => ({
            value: language.id,
            label: <LanguageOptionLabel language={language} />,
          })),
        ]}
        value={languages.some((language) => language.id === value) ? value : 'default'}
      />
    </div>
  );
}

/**
 * Mirrors a scope form's dirty flag up to its section parent. Render it from a
 * `<form.Subscribe selector={(s) => s.isDirty}>` inside the form so only the
 * flag re-renders; the flag resets to clean when the scope form unmounts
 * (keyed remount on scope switch).
 */
export function DirtyStateReporter({ dirty, onDirtyChange }: { dirty: boolean; onDirtyChange?: (dirty: boolean) => void }) {
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  return null;
}

/**
 * The scoped sections' unsaved-changes guard. Scope forms report dirtiness
 * into a ref via `setDirty` (wired through DirtyStateReporter), and `guard` —
 * passed to LanguageScopePicker — asks to discard (styled confirm) before a
 * scope switch while that ref is dirty. A ref keeps per-keystroke dirty
 * updates from re-rendering the section.
 */
export function useScopeDirtyGuard(): { guard: () => Promise<boolean>; setDirty: (dirty: boolean) => void } {
  const t = useT();
  const confirm = useConfirm();
  const dirtyRef = useRef(false);
  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);
  const guard = useCallback(async () => {
    if (!dirtyRef.current) {
      return true;
    }
    return confirm({
      title: t('settings.chrome.scope.discardTitle'),
      description: t('settings.chrome.scope.discardDescription'),
      confirmLabel: t('settings.chrome.scope.discardConfirm'),
      destructive: true,
    });
  }, [confirm, t]);
  return { guard, setDirty };
}

/** The right-aligned Save button row used at the bottom of each form section. */

/** Shared input styling tokens. These layer on top of the base `Input`/`Textarea`
 *  spec (shared standard density, rounded-md, focus ring) — callers inherit that, so the
 *  tokens only carry the font and, for textareas, the taller min-height. */

/** Dense list-row inputs (variable/redirect/navbar rows): shorter and tighter.
 *  They always sit inside a bordered list container, so they carry a solid
 *  background and read as wells instead of border-on-border frames. */
