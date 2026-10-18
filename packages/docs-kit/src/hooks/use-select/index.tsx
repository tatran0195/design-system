import { useCallback, useMemo } from 'react';

export type OptionType = {
  value: string;
  label: string;
  index?: string;
  isAllOption?: boolean;
  hitsPerPage?: number;
};

export type SelectOptions = {
  value: string | string[];
  multiple?: boolean;
  options: OptionType[];
  setSelected?: (value: string | string[]) => void;
  addSelected?: (value: string) => void;
  removeSelected?: (value: string) => void;
  handleAddAll?: (isAllSelected: boolean) => void;
};

export const useSelect = ({ value, options, multiple = false, setSelected, addSelected, removeSelected, handleAddAll }: SelectOptions) => {
  const isValueSelected = useCallback(
    (val: string) => (typeof value === 'string' && val === value) || (Array.isArray(value) && value.includes(val)),
    [value],
  );

  // checks if there are multiple selected values
  const hasSelectedValues = useMemo(() => multiple && Array.isArray(value) && value.length > 0, [value, multiple]);

  // checks if there are any selected values,
  // whether multiple or one
  const hasSelectedValue = useMemo(() => hasSelectedValues || (typeof value === 'string' && value.length), [hasSelectedValues, value]);

  const selectedValues: OptionType[] = useMemo(() => {
    if (typeof value === 'string') {
      const selectedValue = options.find((option) => option.value === value);
      return selectedValue ? [selectedValue] : [];
    }
    if (Array.isArray(value)) {
      return options.filter((option) => value.includes(option.value));
    }
    return [];
  }, [options, value]);

  const isAllSelected = useMemo(() => Array.isArray(value) && value.length === options.length, [options, value]);

  const handleChange = (selectedValue: string, wasSelected: boolean) => {
    if (multiple) {
      if (wasSelected) {
        removeSelected?.(selectedValue);
      } else {
        addSelected?.(selectedValue);
      }
    } else {
      setSelected?.(selectedValue);
    }
  };

  const handleSelectAll = () => {
    if (handleAddAll) {
      handleAddAll(isAllSelected);
    } else {
      setSelected?.(options.map((option) => option.value));
    }
  };

  const setSelectedValues = (values: string[]) => {
    setSelected?.(values);
  };

  return {
    isValueSelected,
    hasSelectedValue,
    hasSelectedValues,
    selectedValues,
    isAllSelected,
    handleChange,
    handleSelectAll,
    setSelectedValues,
  };
};
