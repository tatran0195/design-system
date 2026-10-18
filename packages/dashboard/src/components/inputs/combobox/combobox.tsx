import {
  Combobox as PrimitiveCombobox,
  ComboboxDisclosure as PrimitiveComboboxDisclosure,
  ComboboxItem as PrimitiveComboboxItem,
  ComboboxItemCheck as PrimitiveComboboxItemCheck,
  ComboboxItemValue as PrimitiveComboboxItemValue,
  ComboboxPopover as PrimitiveComboboxPopover,
  ComboboxProvider as PrimitiveComboboxProvider,
  Separator as PrimitiveSeparator,
} from '@ariakit/react';
import { CheckMini, EllipseMiniSolid, PlusMini, TrianglesMini, XMarkMini } from '@cms/icons';
import { Badge, clx, Text, UiLayer } from '@cms/ui';
import { matchSorter } from 'match-sorter';
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ForwardedRef,
  type ReactNode,
  useDeferredValue,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDocumentDirection } from '../../../hooks/use-document-direction';
import { useIntersectionObserver } from '../../../hooks/use-intersection-observer';
import { useTranslation } from '../../../i18n';
import { genericForwardRef } from '../../utilities/generic-forward-ref';

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type Value = string[] | string;

const TABLUAR_NUM_WIDTH = 8;
const TAG_BASE_WIDTH = 28;

export interface ComboboxProps<T extends Value = Value> extends Omit<ComponentPropsWithoutRef<'input'>, 'onChange' | 'value' | 'defaultValue'> {
  value?: T;
  defaultValue?: T;
  multiple?: boolean;
  onChange?: (value?: T) => void;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  options: ComboboxOption[];
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  onCreateOption?: (value: string) => void;
  shouldAlwaysShowCreateOption?: boolean;
  noResultsPlaceholder?: ReactNode;
  allowClear?: boolean;
  forceHideInput?: boolean; // always hide input -> used for singe value select that don't have query/filter
  displayMode?: 'count' | 'chips'; // how to display multiple selected values
}

const ComboboxImpl = <T extends Value = string>(props: ComboboxProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
  const {
    value: controlledValue,
    defaultValue,
    multiple,
    onChange,
    searchValue: controlledSearchValue,
    onSearchValueChange,
    options,
    className,
    placeholder,
    fetchNextPage,
    isFetchingNextPage,
    onCreateOption,
    shouldAlwaysShowCreateOption,
    noResultsPlaceholder,
    allowClear,
    forceHideInput,
    displayMode = 'count',
    ...inputProps
  } = props;
  const [open, setOpen] = useState(false);
  const direction = useDocumentDirection();
  const { t } = useTranslation();

  const comboboxRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => comboboxRef.current!);

  const isValueControlled = Object.hasOwn(props, 'value');
  const isSearchControlled = controlledSearchValue !== undefined;

  const isArrayValue = multiple ?? (Array.isArray(controlledValue) || Array.isArray(defaultValue));
  const emptyState = (isArrayValue ? [] : '') as T;

  const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState(controlledSearchValue || '');
  const defferedSearchValue = useDeferredValue(uncontrolledSearchValue);

  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue ?? emptyState);

  const searchValue = isSearchControlled ? controlledSearchValue : uncontrolledSearchValue;
  const selectedValues = (isValueControlled ? controlledValue : uncontrolledValue) ?? emptyState;

  const handleValueChange = (newValues?: T) => {
    const candidates = Array.isArray(newValues) ? newValues : newValues ? [newValues] : [];
    const previous = Array.isArray(selectedValues) ? selectedValues : selectedValues ? [selectedValues] : [];
    const added = candidates.filter((value) => !previous.includes(value));
    if (added.some((value) => options.some((option) => option.value === value && option.disabled))) return;
    for (const value of added) {
      if (onCreateOption && !options.some((option) => option.value === value)) onCreateOption(value);
    }

    if (!isValueControlled) {
      setUncontrolledValue(newValues || emptyState);
    }

    if (onChange) {
      onChange(newValues);
    }

    setUncontrolledSearchValue('');
    if (onSearchValueChange) {
      onSearchValueChange('');
    }
  };

  const handleSearchChange = (query: string) => {
    setUncontrolledSearchValue(query);

    if (onSearchValueChange) {
      onSearchValueChange(query);
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    if (!isArrayValue || !Array.isArray(selectedValues)) {
      return;
    }

    const newValues = selectedValues.filter((v) => v !== valueToRemove) as T;
    handleValueChange(newValues);
  };

  /**
   * Filter and sort the options based on the search value,
   * and whether the value is already selected.
   *
   * This is only used when the search value is uncontrolled.
   */
  const matches = useMemo(() => {
    if (isSearchControlled) {
      return [];
    }

    // do not use `matcher` if the input is hidden
    if (forceHideInput) {
      return options;
    }

    return matchSorter(options, defferedSearchValue, {
      keys: ['label'],
    });
  }, [options, defferedSearchValue, isSearchControlled, forceHideInput]);

  const lastOptionRef = useIntersectionObserver<HTMLDivElement>({
    enabled: open && Boolean(fetchNextPage) && !isFetchingNextPage,
    onIntersect: () => fetchNextPage?.(),
    threshold: 1,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUncontrolledSearchValue('');
      if (onSearchValueChange) {
        onSearchValueChange('');
      }
    }

    setOpen(open);
  };

  const hasValue = isArrayValue ? selectedValues?.length > 0 : !!selectedValues;

  const showTag = hasValue && isArrayValue;
  const showSelected = showTag && !searchValue && !open;

  const hideInput = forceHideInput || (!isArrayValue && hasValue && !open);
  const selectedLabel = options.find((o) => o.value === selectedValues)?.label;

  const hidePlaceholder = showSelected || open;

  const tagWidth = useMemo(() => {
    if (!Array.isArray(selectedValues)) {
      return TAG_BASE_WIDTH + TABLUAR_NUM_WIDTH; // There can only be a single digit
    }

    const count = selectedValues.length;
    const digits = count.toString().length;

    return TAG_BASE_WIDTH + digits * TABLUAR_NUM_WIDTH;
  }, [selectedValues]);

  const results = useMemo(() => (isSearchControlled ? options : matches), [matches, options, isSearchControlled]);

  const normalizedSearchValue = searchValue?.trim() ?? '';
  const hasLabelMatch =
    !!normalizedSearchValue.length && options.some((option) => option.label.trim().toLowerCase() === normalizedSearchValue.toLowerCase());

  return (
    <PrimitiveComboboxProvider
      open={open}
      setOpen={handleOpenChange}
      selectedValue={selectedValues}
      setSelectedValue={(value) => {
        const normalized = Array.isArray(value) ? value.filter((entry) => entry !== '') : value;
        handleValueChange(normalized as T);
      }}
      value={searchValue}
      setValue={(query) => {
        handleSearchChange(query);
      }}
    >
      {displayMode === 'chips' && isArrayValue ? (
        <div
          dir={direction}
          className={clx(
            'relative flex cursor-pointer flex-wrap items-center gap-1.5',
            'min-h-8 w-full rounded-md',
            'bg-ui-bg-field transition-fg shadow-borders-base',
            'has-[input:focus]:shadow-borders-interactive-with-active',
            'has-[:invalid]:shadow-borders-error has-[[aria-invalid=true]]:shadow-borders-error',
            'has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:text-ui-fg-disabled has-[:disabled]:cursor-not-allowed',
            'p-1',
            className,
          )}
        >
          {Array.isArray(selectedValues) &&
            selectedValues.map((value) => {
              const option = options.find((o) => o.value === value);
              if (!option) return null;

              return (
                <Badge key={value} size="2xsmall" className="transition-fg gap-x-0.5 pl-1.5 pr-1 max-w-full min-w-0 overflow-hidden">
                  <span className="truncate min-w-0">{option.label}</span>
                  <button
                    type="button"
                    disabled={inputProps.disabled}
                    aria-label={`Remove ${option.label}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveValue(value);
                    }}
                    className="text-ui-fg-subtle transition-fg outline-none shrink-0"
                  >
                    <XMarkMini />
                  </button>
                </Badge>
              );
            })}
          <div className="relative flex min-w-[120px] flex-1 items-center">
            <PrimitiveCombobox
              autoSelect
              ref={comboboxRef}
              onFocus={() => setOpen(true)}
              className={clx(
                'ui-control-text txt-compact-small text-ui-fg-base !placeholder:text-ui-fg-muted transition-fg size-full cursor-pointer bg-transparent py-0 pe-8 ps-1 outline-none focus:cursor-text',
              )}
              placeholder={Array.isArray(selectedValues) && selectedValues.length > 0 ? undefined : placeholder}
              {...inputProps}
            />
          </div>
          <PrimitiveComboboxDisclosure
            render={(props) => (
              <button
                {...props}
                type="button"
                aria-label="Toggle options"
                disabled={inputProps.disabled}
                className="text-ui-fg-muted transition-fg hover:bg-ui-bg-field-hover absolute end-0 top-0 flex h-8 w-8 items-center justify-center rounded-e focus-visible:shadow-borders-focus outline-none"
              >
                <TrianglesMini />
              </button>
            )}
          />
        </div>
      ) : (
        <div
          dir={direction}
          className={clx(
            'relative flex cursor-pointer items-center gap-x-2 overflow-hidden',
            'h-8 w-full rounded-md',
            'bg-ui-bg-field transition-fg shadow-borders-base',
            'has-[input:focus]:shadow-borders-interactive-with-active',
            'has-[:invalid]:shadow-borders-error has-[[aria-invalid=true]]:shadow-borders-error',
            'has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:text-ui-fg-disabled has-[:disabled]:cursor-not-allowed',
            className,
          )}
          style={
            {
              '--tag-width': `${tagWidth}px`,
            } as CSSProperties
          }
        >
          {showTag && (
            <button
              type="button"
              disabled={inputProps.disabled}
              aria-label="Clear selection"
              onClick={(e) => {
                e.preventDefault();
                handleValueChange(isArrayValue ? ([] as unknown as T) : undefined);
              }}
              className="bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg absolute start-0.5 top-0.5 z-[1] flex h-[28px] items-center rounded-[4px] border py-[3px] pe-1 ps-1.5 outline-none"
            >
              <span className="tabular-nums">{selectedValues.length}</span>
              <XMarkMini className="text-ui-fg-muted" />
            </button>
          )}
          <div className="relative flex size-full items-center">
            {showSelected && (
              <div
                className={clx('pointer-events-none absolute inset-y-0 flex size-full items-center', {
                  'start-[calc(var(--tag-width)+8px)]': showTag,
                  'start-2': !showTag,
                })}
              >
                <Text size="small" leading="compact" className="ui-control-text flex h-full items-center">
                  {t('general.selected')}
                </Text>
              </div>
            )}
            {hideInput && (
              <div
                className={clx('pointer-events-none absolute inset-y-0 flex size-full items-center overflow-hidden', {
                  'start-[calc(var(--tag-width)+8px)]': showTag,
                  'start-2': !showTag,
                })}
              >
                <Text size="small" leading="compact" className="ui-control-text flex h-full items-center truncate">
                  {selectedLabel}
                </Text>
              </div>
            )}
            <PrimitiveCombobox
              autoSelect
              ref={comboboxRef}
              onFocus={() => setOpen(true)}
              className={clx(
                'ui-control-text txt-compact-small text-ui-fg-base !placeholder:text-ui-fg-muted transition-fg size-full cursor-pointer bg-transparent py-0 pe-8 ps-2 outline-none focus:cursor-text',
                {
                  'opacity-0': hideInput,
                  'ps-2': !showTag,
                  'ps-[calc(var(--tag-width)+8px)]': showTag,
                },
              )}
              placeholder={hidePlaceholder ? undefined : placeholder}
              {...inputProps}
            />
          </div>
          {allowClear && hasValue && (
            <button
              type="button"
              disabled={inputProps.disabled}
              aria-label="Clear selection"
              onClick={(e) => {
                e.preventDefault();
                handleValueChange(isArrayValue ? ([] as unknown as T) : undefined);
              }}
              className="bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg absolute end-[28px] top-0.5 z-[1] flex h-[28px] items-center rounded-[4px] border px-1.5 py-[2px] outline-none"
            >
              <XMarkMini className="text-ui-fg-muted" />
            </button>
          )}
          <PrimitiveComboboxDisclosure
            render={(props) => (
              <button
                {...props}
                type="button"
                aria-label="Toggle options"
                disabled={inputProps.disabled}
                className="text-ui-fg-muted transition-fg hover:bg-ui-bg-field-hover absolute end-0 flex size-8 items-center justify-center rounded-e focus-visible:shadow-borders-focus outline-none"
              >
                <TrianglesMini />
              </button>
            )}
          />
        </div>
      )}
      <UiLayer kind="popover">
        {(layer) => (
          <PrimitiveComboboxPopover
            data-ui-layer="popover"
            dir={direction}
            gutter={4}
            sameWidth
            ref={listboxRef}
            role="listbox"
            className={clx(
              'shadow-elevation-flyout bg-ui-bg-base z-ui-popover rounded-[8px] p-1',
              'max-h-[200px] overflow-y-auto',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=start]:slide-in-from-end-2 data-[side=end]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2',
            )}
            style={{
              zIndex: layer,
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            {results.map(({ value, label, disabled }) => (
              <PrimitiveComboboxItem
                key={value}
                value={value}
                focusOnHover
                setValueOnClick={false}
                disabled={disabled}
                className={clx(
                  'transition-fg bg-ui-bg-base data-[active-item=true]:bg-ui-bg-base-hover group flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1',
                  {
                    'text-ui-fg-disabled': disabled,
                    'bg-ui-bg-component': disabled,
                  },
                )}
              >
                <PrimitiveComboboxItemCheck className="flex !size-5 items-center justify-center">
                  {isArrayValue ? <CheckMini /> : <EllipseMiniSolid />}
                </PrimitiveComboboxItemCheck>
                <PrimitiveComboboxItemValue className="txt-compact-small">{label}</PrimitiveComboboxItemValue>
              </PrimitiveComboboxItem>
            ))}
            {!!fetchNextPage && <div ref={lastOptionRef} className="w-px" />}
            {isFetchingNextPage && (
              <div className="transition-fg bg-ui-bg-base flex items-center rounded-[4px] px-2 py-1.5">
                <div className="bg-ui-bg-component size-full h-5 w-full animate-pulse rounded-[4px]" />
              </div>
            )}
            {!results.length &&
              (noResultsPlaceholder && !searchValue?.length ? (
                noResultsPlaceholder
              ) : (
                <div className="flex items-center gap-x-2 rounded-[4px] px-2 py-1.5">
                  <Text size="small" leading="compact" className="text-ui-fg-subtle">
                    {t('general.noResultsTitle')}
                  </Text>
                </div>
              ))}
            {(!results.length || (shouldAlwaysShowCreateOption && normalizedSearchValue.length > 0)) &&
              normalizedSearchValue.length > 0 &&
              onCreateOption && (
                <>
                  <PrimitiveSeparator className="bg-ui-border-base -mx-1" />
                  <PrimitiveComboboxItem
                    value={searchValue}
                    focusOnHover
                    setValueOnClick={false}
                    disabled={hasLabelMatch}
                    className={clx(
                      'transition-fg bg-ui-bg-base data-[active-item=true]:bg-ui-bg-base-hover group mt-1 flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1.5',
                      {
                        'text-ui-fg-disabled bg-ui-bg-component cursor-not-allowed': hasLabelMatch,
                      },
                    )}
                  >
                    <PlusMini className="text-ui-fg-subtle" />
                    <Text size="small" leading="compact">
                      {t('actions.create')} &quot;{searchValue}&quot;
                    </Text>
                  </PrimitiveComboboxItem>
                </>
              )}
          </PrimitiveComboboxPopover>
        )}
      </UiLayer>
    </PrimitiveComboboxProvider>
  );
};

export const Combobox = genericForwardRef(ComboboxImpl);
