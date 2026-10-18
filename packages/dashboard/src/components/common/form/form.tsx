'use client';

import { InformationCircleSolid } from '@cms/icons';
import { clx, Hint as HintComponent, Label as LabelComponent, Slot, Text, Tooltip } from '@cms/ui';
import {
  Children,
  type ComponentPropsWithoutRef,
  cloneElement,
  createContext,
  type ForwardRefExoticComponent,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type RefAttributes,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import { Controller, type ControllerProps, type FieldPath, type FieldValues, FormProvider, useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from '../../../i18n';

const FieldContext = createContext<{ name: string } | null>(null);
interface ItemContextValue {
  id: string;
  descriptions: string[];
  labels: string[];
  controlId?: string;
  setControlId: (id: string | undefined) => void;
  register: (kind: 'description' | 'label', id: string) => () => void;
}
const ItemContext = createContext<ItemContextValue | null>(null);
function Field<T extends FieldValues, TName extends FieldPath<T>>(props: ControllerProps<T, TName>) {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FieldContext.Provider>
  );
}
export function useFormField() {
  const field = useContext(FieldContext);
  const item = useContext(ItemContext);
  const form = useFormContext();
  if (!field || !item || !form) throw new Error('useFormField requires Form, Form.Field and Form.Item ancestors.');
  const state = useFormState({ control: form.control, name: field.name });
  return {
    ...form.getFieldState(field.name, state),
    name: field.name,
    id: item.id,
    formItemId: `${item.id}-control`,
    formLabelId: `${item.id}-label`,
    formDescriptionId: `${item.id}-hint`,
    formErrorMessageId: `${item.id}-error`,
    item,
  };
}
export interface DashboardFormItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Explicit ID for a control rendered inside an opaque child component. */ controlId?: string;
}
const Item = forwardRef<HTMLDivElement, DashboardFormItemProps>(function FormItem({ className, controlId: explicitControlId, ...props }, ref) {
  const id = useId();
  const [controlId, setControlId] = useState<string>();
  const [registered, setRegistered] = useState<Record<string, 'description' | 'label'>>({});
  const register = useCallback((kind: 'description' | 'label', id: string) => {
    setRegistered((previous) => (previous[id] === kind ? previous : { ...previous, [id]: kind }));
    return () =>
      setRegistered((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });
  }, []);
  const field = useContext(FieldContext);
  const form = useFormContext();
  const bindings: { controlId?: string; labels: string[]; descriptions: string[] } = { labels: [], descriptions: [] };
  const walk = (nodes: ReactNode) =>
    Children.forEach(nodes, (node) => {
      if (!isValidElement<{ children?: ReactNode; id?: string }>(node)) return;
      if (node.type === Control) {
        const child = isValidElement<{ id?: string }>(node.props.children) ? node.props.children : undefined;
        bindings.controlId = node.props.id ?? child?.props.id ?? `${id}-control`;
      }
      if (node.type === Label) bindings.labels.push(node.props.id ?? `${id}-label`);
      if (node.type === Hint) bindings.descriptions.push(node.props.id ?? `${id}-hint`);
      if (node.type === ErrorMessage && (node.props.children || (field && form?.getFieldState(field.name).error?.message)))
        bindings.descriptions.push(node.props.id ?? `${id}-error`);
      walk(node.props.children);
    });
  walk(props.children);
  const value = {
    id,
    descriptions: [...new Set([...bindings.descriptions, ...Object.keys(registered).filter((id) => registered[id] === 'description')])],
    labels: [...new Set([...bindings.labels, ...Object.keys(registered).filter((id) => registered[id] === 'label')])],
    controlId: explicitControlId ?? bindings.controlId ?? controlId,
    setControlId,
    register,
  };
  return (
    <ItemContext.Provider value={value}>
      <div {...props} ref={ref} className={clx('flex flex-col gap-2', className)} />
    </ItemContext.Provider>
  );
});
export interface DashboardFormLabelProps extends ComponentPropsWithoutRef<typeof LabelComponent> {
  optional?: boolean;
  tooltip?: ReactNode;
  icon?: ReactNode;
}
const Label: ForwardRefExoticComponent<DashboardFormLabelProps & RefAttributes<HTMLLabelElement>> = forwardRef<
  HTMLLabelElement,
  DashboardFormLabelProps
>(function FormLabel({ optional, tooltip, icon, ...props }, ref) {
  const { formLabelId, formItemId, item } = useFormField();
  const { t } = useTranslation();
  const labelId = props.id ?? formLabelId;
  useEffect(() => item.register('label', labelId), [item.register, labelId]);
  return (
    <div className="flex items-center gap-1">
      <LabelComponent {...props} ref={ref} id={labelId} htmlFor={props.htmlFor ?? item.controlId ?? formItemId} size="small" weight="plus" />
      {tooltip && (
        <Tooltip content={tooltip}>
          <button type="button" aria-label="More information" className="text-ui-fg-muted focus-visible:shadow-borders-focus rounded outline-none">
            <InformationCircleSolid />
          </button>
        </Tooltip>
      )}
      {icon}
      {optional && (
        <Text size="small" leading="compact" className="text-ui-fg-muted">
          ({t('fields.optional')})
        </Text>
      )}
    </div>
  );
});
const Control = forwardRef<HTMLElement, ComponentPropsWithoutRef<typeof Slot.Root>>(function FormControl(props, ref) {
  const { error, formItemId, item } = useFormField();
  type ChildProps = Pick<ComponentPropsWithoutRef<'input'>, 'id' | 'aria-describedby' | 'aria-labelledby' | 'aria-invalid'>;
  const child = isValidElement<ChildProps>(props.children) ? props.children : undefined;
  const id = props.id ?? child?.props.id ?? item.controlId ?? formItemId;
  useEffect(() => {
    item.setControlId(id);
    return () => item.setControlId(undefined);
  }, [item.setControlId, id]);
  const describedBy =
    [
      ...new Set(
        [...item.descriptions, props['aria-describedby'], child?.props['aria-describedby']].filter(Boolean).flatMap((value) => value!.split(/\s+/)),
      ),
    ].join(' ') || undefined;
  const attributes = {
    id,
    'aria-invalid': props['aria-invalid'] ?? child?.props['aria-invalid'] ?? Boolean(error),
    'aria-labelledby': props['aria-labelledby'] ?? child?.props['aria-labelledby'] ?? (item.labels.join(' ') || undefined),
    'aria-describedby': describedBy,
  };
  return (
    <Slot.Root {...props} {...attributes} ref={ref}>
      {child ? cloneElement(child, attributes) : props.children}
    </Slot.Root>
  );
});
const Hint = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function FormHint(props, ref) {
  const { formDescriptionId, item } = useFormField();
  const id = props.id ?? formDescriptionId;
  useEffect(() => item.register('description', id), [item.register, id]);
  return <HintComponent {...props} id={id} ref={ref} />;
});
const ErrorMessage = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function FormErrorMessage({ children, ...props }, ref) {
  const { error, formErrorMessageId, item } = useFormField();
  const body = error?.message ? String(error.message) : children;
  const id = props.id ?? formErrorMessageId;
  const visible = Boolean(body);
  useEffect(() => (visible ? item.register('description', id) : undefined), [visible, item.register, id]);
  if (!visible) return null;
  return (
    <HintComponent {...props} ref={ref} id={id} role="alert" variant={error ? 'error' : 'info'}>
      {body}
    </HintComponent>
  );
});
export type DashboardFormComponent = typeof FormProvider & {
  Field: typeof Field;
  Item: typeof Item;
  Label: typeof Label;
  Control: typeof Control;
  Hint: typeof Hint;
  ErrorMessage: typeof ErrorMessage;
};
export const Form: DashboardFormComponent = Object.assign(FormProvider, { Field, Item, Label, Control, Hint, ErrorMessage });
