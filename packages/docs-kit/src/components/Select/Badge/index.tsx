'use client';

import { TriangleDownMini } from '@cms/icons';
import clsx from 'clsx';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { useSelect } from '@/hooks';
import { SelectDropdown, type SelectProps } from '..';

export const SelectBadge = ({
  value,
  options,
  setSelected,
  addSelected,
  removeSelected,
  multiple,
  className,
  addAll = multiple,
  handleAddAll,
  ...props
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isValueSelected, isAllSelected, handleChange, handleSelectAll, setSelectedValues } = useSelect({
    value,
    options,
    multiple,
    setSelected,
    removeSelected,
    addSelected,
    handleAddAll,
  });

  const getSelectedText = useCallback(() => {
    let str = '';
    const selectedOptions = options.filter((option) => value.includes(option.value));

    if (isAllSelected) {
      str = 'All areas';
    } else if ((!Array.isArray(value) && !value) || (Array.isArray(value) && !value.length)) {
      str = 'No Filters Selected';
    } else {
      str = selectedOptions[0].label;
    }

    return (
      <span className={clsx('text-compact-x-small-plus text-cms-tag-neutral-text')}>
        {str}
        {!isAllSelected && selectedOptions.length > 1 && <> + {selectedOptions.length - 1}</>}
      </span>
    );
  }, [isAllSelected, options, value]);

  return (
    <div className={clsx('relative w-fit', className)} data-testid="select-badge">
      <div
        className={clsx(
          'border-cms-tag-neutral-border rounded-docs_sm border border-solid',
          'h-fit cursor-pointer pl-docs_0.25 pr-[3px] text-cms-tag-neutral-text',
          'bg-cms-tag-neutral-bg',
          'flex items-center gap-[3px] whitespace-nowrap',
          'text-cms-fg-subtle',
          open && 'bg-cms-tag-neutral-bg-hover',
        )}
        ref={ref}
        onClick={(e) => {
          if (!dropdownRef.current?.contains(e.target as Element)) {
            setOpen((prev) => !prev);
          }
        }}
        data-testid="select-badge-dropdown"
      >
        {getSelectedText()}
        <TriangleDownMini className="text-cms-tag-neutral-icon" />
      </div>
      <input type="hidden" name={props.name} value={Array.isArray(value) ? value.join(',') : value} />
      <SelectDropdown
        options={options}
        open={open}
        setOpen={setOpen}
        addAll={addAll}
        multiple={multiple}
        isAllSelected={isAllSelected}
        isValueSelected={isValueSelected}
        handleSelectAll={handleSelectAll}
        handleChange={handleChange}
        parentRef={ref as React.RefObject<HTMLDivElement>}
        passedRef={dropdownRef}
        setSelectedValues={setSelectedValues}
      />
    </div>
  );
};

export default SelectBadge;
