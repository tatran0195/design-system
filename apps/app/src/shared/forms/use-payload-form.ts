import { zodResolver } from '@hookform/resolvers/zod';
import type { BaseSyntheticEvent, Dispatch, SetStateAction } from 'react';
import { type FieldPath, type FieldPathValue, type FieldValues, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';
import { toast } from '@/shared/ui/sonner';

function isUpdater<Value>(action: SetStateAction<Value>): action is (previous: Value) => Value {
  return typeof action === 'function';
}
function resolveAction<Value>(action: SetStateAction<Value>, previous: Value): Value {
  if (isUpdater<Value>(action)) return action(previous);
  return action;
}
function firstMessage(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return;
  if ('message' in value && typeof value.message === 'string') return value.message;
  for (const child of Object.values(value)) {
    const message = firstMessage(child);
    if (message) return message;
  }
}

/** Controlled-value migration boundary for the copied payload editors. Values,
 * validation, dirty tracking and submission all belong to one RHF form; local
 * React state is reserved for presentation (open panels, step, API feedback).
 * `values` lets RHF reset when a different entity is supplied, without syncing
 * individual fields in effects. */
export function usePayloadForm<Values extends FieldValues>(schema: z.ZodType<Values, Values>, defaults: NoInfer<Values>) {
  const methods = useForm<Values>({ values: defaults, resolver: zodResolver(schema), mode: 'onChange' });
  useWatch({ control: methods.control });
  function field<Name extends FieldPath<Values>>(name: Name): [FieldPathValue<Values, Name>, Dispatch<SetStateAction<FieldPathValue<Values, Name>>>] {
    methods.register(name);
    return [
      methods.getValues(name),
      (action) => {
        const next = resolveAction(action, methods.getValues(name));
        methods.setValue(name, next, { shouldDirty: true, shouldValidate: true });
      },
    ];
  }
  function inputRef<Name extends FieldPath<Values>>(name: Name) {
    return methods.register(name).ref;
  }
  function submit(handler: SubmitHandler<Values>) {
    return async (event?: BaseSyntheticEvent): Promise<void> => {
      await methods.handleSubmit(handler, (errors) => {
        const message = firstMessage(errors);
        if (message) toast.error(message);
      })(event);
    };
  }
  return { ...methods, field, inputRef, submit };
}
