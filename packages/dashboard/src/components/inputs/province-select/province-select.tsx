'use client';
import { Select } from '@cms/ui';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { useTranslation } from '../../../i18n';
import { getCountryProvinceObjectByIso2 } from '../../../lib/data/country-states';
export interface ProvinceSelectProps extends ComponentPropsWithoutRef<typeof Select> {
  placeholder?: string;
  country_code?: string;
  valueAs?: 'iso_2' | 'name';
  options?: { value: string; label: string }[];
  onChange?: (value: string) => void;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}
export const ProvinceSelect = forwardRef<HTMLButtonElement, ProvinceSelectProps>(function ProvinceSelect(
  {
    placeholder,
    country_code = '',
    valueAs = 'iso_2',
    options,
    onChange,
    onValueChange,
    disabled,
    id,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const province = getCountryProvinceObjectByIso2(country_code);
  const choices =
    options ?? Object.entries(province?.options ?? {}).map(([code, label]) => ({ value: valueAs === 'iso_2' ? code.toLowerCase() : label, label }));
  return (
    <Select
      {...props}
      disabled={disabled || !choices.length}
      onValueChange={(value) => {
        onChange?.(value);
        if (onValueChange !== onChange) onValueChange?.(value);
      }}
    >
      <Select.Trigger
        ref={ref}
        id={id}
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className="w-full"
      >
        <Select.Value
          placeholder={placeholder ?? (province ? t(`taxRegions.fields.sublevels.placeholders.${province.type}`) : t('fields.province'))}
        />
      </Select.Trigger>
      <Select.Content>
        {choices.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
});
