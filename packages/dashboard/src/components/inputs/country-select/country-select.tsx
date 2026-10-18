'use client';
import { forwardRef } from 'react';
import { useTranslation } from '../../../i18n';
import { countries as defaultCountries } from '../../../lib/data/countries';
import type { CountryOption } from '../../../types/records';
import { Combobox, type ComboboxOption, type ComboboxProps } from '../combobox';
export interface CountrySelectProps extends Omit<ComboboxProps<string>, 'options' | 'multiple'> {
  countries?: readonly CountryOption[];
  options?: ComboboxOption[];
}
export const CountrySelect = forwardRef<HTMLInputElement, CountrySelectProps>(function CountrySelect(
  { countries = defaultCountries, options, placeholder, ...props },
  ref,
) {
  const { t } = useTranslation();
  return (
    <Combobox<string>
      {...props}
      ref={ref}
      placeholder={placeholder ?? t('fields.selectCountry')}
      options={
        options ??
        countries.map((country) => ({
          label: country.display_name || country.name || country.iso_2.toUpperCase(),
          value: country.iso_2.toLowerCase(),
        }))
      }
    />
  );
});
