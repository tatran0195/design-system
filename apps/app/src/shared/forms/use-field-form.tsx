import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { type FieldPath, type FieldPathValue, type FieldValues, useController, useFormState, useForm as useRHF, useWatch } from 'react-hook-form';
import { z } from 'zod';

type Validator<Value> = (field: { value: Value }) => string | undefined;
type Item<Value> = Value extends Array<infer Entry> ? Entry : never;
interface Snapshot<Values> {
  values: Values;
  isSubmitting: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  isValid: boolean;
}
interface FieldProps<Values extends FieldValues, Name extends FieldPath<Values>> {
  name: Name;
  mode?: 'array';
  validators?: { onChange?: Validator<FieldPathValue<Values, Name>>; onSubmit?: Validator<FieldPathValue<Values, Name>> };
  children: (field: {
    name: Name;
    state: { value: FieldPathValue<Values, Name>; meta: { errors: string[]; isTouched: boolean; isDirty: boolean } };
    handleBlur: () => void;
    handleChange: (value: FieldPathValue<Values, Name>) => void;
    pushValue: (value: Item<FieldPathValue<Values, Name>>) => void;
    removeValue: (index: number) => void;
  }) => ReactNode;
}

/** Compound RHF field/render presentation API. RHF owns
 * every value, array, dirty flag and submit. Existing field checks run in Zod.
 * There is no per-field React state or effect-driven payload synchronization. */
export function useFieldForm<Values extends FieldValues>(options: {
  defaultValues: Values;
  onSubmit: (context: { value: Values }) => void | Promise<void>;
}) {
  const validators = useRef(new Map<string, () => string | undefined>());
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const schema = useMemo(
    () =>
      z
        .custom<Values>((value) => typeof value === 'object' && value !== null && !Array.isArray(value))
        .superRefine((_value, context) => {
          for (const [name, validate] of validators.current) {
            const message = validate();
            if (message) context.addIssue({ code: 'custom', message, path: name.split('.') });
          }
        }),
    [],
  );
  const methods = useRHF<Values>({ values: options.defaultValues, resolver: zodResolver(schema), mode: 'onChange' });
  const { control, getValues, setValue } = methods;

  const Field = useMemo(
    () =>
      function FormField<Name extends FieldPath<Values>>({ name, validators: checks, children }: FieldProps<Values, Name>) {
        const { field, fieldState } = useController({ name, control });
        useEffect(() => {
          validators.current.set(name, () => checks?.onChange?.({ value: getValues(name) }) ?? checks?.onSubmit?.({ value: getValues(name) }));
          return () => {
            validators.current.delete(name);
          };
        }, [name, checks, getValues]);
        return (
          <>
            {children({
              name,
              state: {
                value: field.value,
                meta: {
                  errors: fieldState.error?.message ? [fieldState.error.message] : [],
                  isTouched: fieldState.isTouched,
                  isDirty: fieldState.isDirty,
                },
              },
              handleBlur: field.onBlur,
              handleChange: field.onChange,
              pushValue: (value) => {
                const current = getValues(name);
                if (Array.isArray(current)) field.onChange([...current, value]);
              },
              removeValue: (index) => {
                const current = getValues(name);
                if (Array.isArray(current)) field.onChange(current.filter((_entry: unknown, i: number) => i !== index));
              },
            })}
          </>
        );
      },
    [control, getValues],
  );

  const Subscribe = useMemo(
    () =>
      function FormSubscription<Selected>({
        selector,
        children,
      }: {
        selector: (state: Snapshot<Values>) => Selected;
        children: (selection: Selected) => ReactNode;
      }) {
        useWatch({ control });
        const state = useFormState({ control });
        return (
          <>
            {children(
              selector({
                values: getValues(),
                isSubmitting: state.isSubmitting,
                isDirty: state.isDirty,
                canSubmit: state.isValid && !state.isSubmitting,
                isValid: state.isValid,
              }),
            )}
          </>
        );
      },
    [control, getValues],
  );

  return useMemo(
    () => ({
      Field,
      Subscribe,
      handleSubmit: () => methods.handleSubmit((value) => optionsRef.current.onSubmit({ value }))(),
      reset: (values?: Values) => methods.reset(values),
      setFieldValue: <Name extends FieldPath<Values>>(name: Name, value: FieldPathValue<Values, Name>) =>
        setValue(name, value, { shouldDirty: true, shouldValidate: true }),
    }),
    [Field, Subscribe, methods, setValue],
  );
}
