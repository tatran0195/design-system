import { Tooltip } from '@cms/ui';
import type { CountryOption } from '../../../../../types/records';
import { PlaceholderCell } from '../../common/placeholder-cell';
export function countryCodeToEmoji(code: string): string {
  const value = code.toUpperCase();
  return /^[A-Z]{2}$/.test(value) ? String.fromCodePoint(...Array.from(value, (char) => 0x1_f1_e6 + char.charCodeAt(0) - 65)) : '';
}
export function CountryCell({ country }: { country?: CountryOption | null }) {
  if (!country) return <PlaceholderCell />;
  const label = country.display_name || country.name || country.iso_2.toUpperCase();
  return (
    <Tooltip content={label}>
      <span role="img" aria-label={label} className="inline-flex size-5 items-center justify-center">
        {countryCodeToEmoji(country.iso_2) || country.iso_2.toUpperCase()}
      </span>
    </Tooltip>
  );
}
