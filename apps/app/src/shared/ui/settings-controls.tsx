import { cloneElement, isValidElement, type ReactNode, useId } from 'react';
import { useT } from '@/shared/i18n/react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/segmented-control';
import { Slider } from '@/shared/ui/slider';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/ui/utils';
export function SectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="mb-6 border-border border-b pb-3">
      <div className="flex items-center gap-2.5">
        <span className="text-base text-muted-foreground">{icon}</span>
        <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
      </div>
      {description ? <p className="mt-1.5 text-[13px] text-muted-foreground leading-snug">{description}</p> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  const generatedId = useId();
  const isDirectControl =
    isValidElement<{ id?: string }>(children) && (children.type === Input || children.type === Textarea || children.type === Slider);
  const childId = isDirectControl ? children.props.id : undefined;
  const controlId = htmlFor ?? childId ?? (isDirectControl ? generatedId : undefined);
  const labelledChildren = isDirectControl ? cloneElement(children, { id: controlId }) : children;

  return (
    <div className={cn('mb-6', className)}>
      <label className="block font-semibold text-[13px]" htmlFor={controlId}>
        {label}
      </label>
      {hint ? <p className="mt-1 mb-2.5 text-[12.5px] text-muted-foreground leading-snug">{hint}</p> : <div className="mb-2.5" />}
      {labelledChildren}
    </div>
  );
}

export function GroupLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('font-semibold text-[13px]', className)}>{children}</div>;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  disabled = false,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: ReactNode }>;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <SegmentedControl className={cn('w-full', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <SegmentedControlItem
            active={active}
            className="px-3"
            disabled={disabled}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </SegmentedControlItem>
        );
      })}
    </SegmentedControl>
  );
}

export function ToggleRow({
  title,
  hint,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  title: string;
  hint?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  // Associate the visible title with the Switch so assistive tech announces a
  // name (the base-ui switch has no intrinsic label otherwise).
  const titleId = useId();
  return (
    <div className="flex items-center gap-4 border-border border-t py-3.5">
      <div className={cn('flex-1 leading-snug', disabled && 'opacity-60')}>
        <div id={titleId} className="font-medium text-[13.5px]">
          {title}
        </div>
        {hint ? <div className="mt-0.5 text-[12px] text-muted-foreground">{hint}</div> : null}
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} aria-labelledby={titleId} />
    </div>
  );
}

export function SaveBar({ isSubmitting, disabled = false }: { isSubmitting: boolean; disabled?: boolean }) {
  const t = useT();
  return (
    <div className="mt-2 flex justify-end">
      <Button disabled={isSubmitting || disabled} type="submit">
        {isSubmitting ? t('common.saving') : t('common.save')}
      </Button>
    </div>
  );
}

export const FIELD_INPUT = 'text-sm';

export const FIELD_MONO = 'font-mono text-sm';

export const FIELD_TEXTAREA = 'min-h-[84px] text-sm';

export const FIELD_COMPACT = '[--control-size-default:var(--control-size-compact)] rounded-md bg-background text-[13px]';

export const FIELD_COMPACT_MONO = '[--control-size-default:var(--control-size-compact)] rounded-md bg-background font-mono text-[13px]';
