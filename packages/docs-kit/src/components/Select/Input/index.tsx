'use client';

import { Badge } from '@cms/docs-kit';
import { ChevronUpDown, XMarkMini } from '@cms/icons';
import clsx from 'clsx';
import type React from 'react';
import { useRef, useState } from 'react';
import { useSelect } from '@/hooks';
import { SelectDropdown, type SelectProps } from '..';

export const SelectInput = ({
  value,
  options,
  setSelected,
  addSelected,
  removeSelected,
  multiple,
  className,
  addAll = multiple,
  handleAddAll,
  showClearButton = true,
  ...props
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isValueSelected, hasSelectedValue, hasSelectedValues, selectedValues, isAllSelected, handleChange, handleSelectAll } = useSelect({
    value,
    options,
    multiple,
    setSelected,
    removeSelected,
    addSelected,
    handleAddAll,
  });

  return (
    <div
      className={clsx(
        'px-docs_0.75 relative py-[9px]',
        'border-cms-border-base rounded-docs_sm border border-solid',
        'bg-cms-bg-field shadow-button-neutral dark:shadow-button-neutral-dark',
        'hover:bg-cms-bg-field-hover',
        'active:shadow-active dark:active:shadow-active-dark',
        'focus:shadow-active dark:focus:shadow-active-dark',
        'text-cms-fg-base text-compact-medium',
        'disabled:bg-cms-bg-disabled',
        'disabled:text-cms-fg-disabled',
        'flex items-center gap-docs_0.5',
        !hasSelectedValues && 'placeholder:text-cms-fg-muted',
        hasSelectedValues && 'placeholder:text-cms-fg-base',
        className,
      )}
      ref={ref}
      onClick={(e) => {
        if (!dropdownRef.current?.contains(e.target as Element)) {
          setOpen((prev) => !prev);
        }
      }}
      data-testid="select-input"
    >
      {hasSelectedValues && (
        <Badge variant="neutral" className={clsx('flex', showClearButton && 'flex-1')}>
          <span className={clsx('text-compact-medium-plus inline-block', showClearButton && 'mr-docs_0.125')}>{(value as string[]).length}</span>
          {showClearButton && (
            <XMarkMini
              className="text-cms-tag-neutral-icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelected?.([]);
              }}
            />
          )}
        </Badge>
      )}
      <span className={clsx('inline-block flex-1 select-none overflow-ellipsis whitespace-nowrap break-words', hasSelectedValues && 'max-w-1/3')}>
        {!multiple && hasSelectedValue && selectedValues.length ? selectedValues[0].label : props.placeholder}
      </span>
      <ChevronUpDown className="text-cms-fg-muted" />
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
      />
    </div>
  );
};
