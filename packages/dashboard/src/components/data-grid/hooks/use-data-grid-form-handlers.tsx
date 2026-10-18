import { useCallback } from 'react';
import type { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import type { DataGridMatrix } from '../models';
import type { DataGridColumnType, DataGridCoordinates, DataGridToggleableNumber } from '../types';

type UseDataGridFormHandlersOptions<TData extends object, TFieldValues extends FieldValues> = {
  matrix: DataGridMatrix<TData, TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  anchor: DataGridCoordinates | null;
};

export const useDataGridFormHandlers = <TData extends object, TFieldValues extends FieldValues>({
  matrix,
  form,
  anchor,
}: UseDataGridFormHandlersOptions<TData, TFieldValues>) => {
  const { getValues, setValue: setFormValue } = form;

  const getSelectionValues = useCallback(
    (fields: string[]): PathValue<TFieldValues, Path<TFieldValues>>[] => {
      if (!fields.length) {
        return [];
      }

      return fields.map((field) => getValues(field as Path<TFieldValues>));
    },
    [getValues],
  );

  const setSelectionValues = useCallback(
    (fields: string[], values: unknown[], isHistory?: boolean) => {
      if (!fields.length || !values.length) return;
      // Validate and convert every field before writing anything (mixed-column-safe,
      // atomic on conversion failure, and no mutation of RHF's internal objects).
      const updates = fields.map((field, index) => {
        if (field.split(/[.[\]]/).some((part) => ['__proto__', 'prototype', 'constructor'].includes(part))) throw new Error('Unsafe grid field path');
        const coordinates = matrix.getCoordinatesByField(field);
        const type = coordinates && matrix.getCellType(coordinates);
        if (!type) throw new Error(`Unknown grid field: ${field}`);
        let value = convertArrayToPrimitive([values[index % values.length]], type)[0];
        if (type === 'togglable-number') {
          const current = getValues(field as Path<TFieldValues>) as DataGridToggleableNumber | undefined;
          const disabledToggle = current?.disabledToggle ?? false;
          const quantity = disabledToggle && value.quantity === '' ? 0 : value.quantity;
          value = {
            ...value,
            quantity,
            disabledToggle,
            checked: disabledToggle || (isHistory ? Boolean(value.checked) : quantity !== '' && quantity != null),
          };
        }
        return { field, value };
      });
      updates.forEach(({ field, value }) => setFormValue(field as Path<TFieldValues>, value, { shouldDirty: true, shouldTouch: true }));
    },
    [matrix, getValues, setFormValue],
  );

  return {
    getSelectionValues,
    setSelectionValues,
  };
};

function convertToNumber(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }

  const converted = Number(value);

  if (!Number.isFinite(converted)) {
    throw new Error(`String "${value}" cannot be converted to number.`);
  }

  return converted;
}

function convertToBoolean(value: string | boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'undefined' || value === null) {
    return false;
  }

  const lowerValue = String(value).trim().toLowerCase();

  if (['true', 'false', '1', '0', ''].includes(lowerValue)) {
    return lowerValue === 'true' || lowerValue === '1';
  }

  throw new Error(`String "${value}" cannot be converted to boolean.`);
}

function covertToString(value: any): string {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }

  return String(value);
}

function convertToggleableNumber(value: any): {
  quantity: number | string;
  checked: boolean;
  disabledToggle: boolean;
} {
  if (value == null || value === '') return { quantity: '', checked: false, disabledToggle: false };
  let obj = value;
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch {
      obj = convertToNumber(obj);
    }
  }
  if (typeof obj === 'number') return { quantity: convertToNumber(obj), checked: true, disabledToggle: false };
  if (typeof obj !== 'object' || obj === null || !('quantity' in obj)) throw new Error('Invalid toggleable number');
  return {
    quantity: obj.quantity === '' ? '' : convertToNumber(obj.quantity),
    checked: Boolean(obj.checked),
    disabledToggle: Boolean(obj.disabledToggle),
  };
}

export function convertArrayToPrimitive(values: any[], type: DataGridColumnType): any[] {
  switch (type) {
    case 'number':
      return values.map((v) => {
        if (v === '') {
          return v;
        }

        if (v == null) {
          return '';
        }

        return convertToNumber(v);
      });
    case 'togglable-number':
      return values.map(convertToggleableNumber);
    case 'boolean':
      return values.map(convertToBoolean);
    case 'text':
    case 'multiline-text':
      return values.map(covertToString);
    default:
      throw new Error(`Unsupported target type "${type}".`);
  }
}
