import { useMemo } from 'react';
import { useDashboardLocale } from '../config';
export function useDate(options: { locale?: string; now?: () => Date } = {}) {
  const configured = useDashboardLocale();
  const locale = options.locale ?? configured;
  const now = options.now;
  return useMemo(
    () => ({
      getFullDate({ date, includeTime = false }: { date: string | Date; includeTime?: boolean }) {
        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return '';
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', ...(includeTime ? { timeStyle: 'short' as const } : {}) }).format(value);
      },
      getRelativeDate(date: string | Date) {
        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return '';
        const seconds = (value.getTime() - (now?.() ?? new Date()).getTime()) / 1000;
        const units: [Intl.RelativeTimeFormatUnit, number][] = [
          ['year', 31_536_000],
          ['month', 2_592_000],
          ['week', 604_800],
          ['day', 86_400],
          ['hour', 3600],
          ['minute', 60],
          ['second', 1],
        ];
        const [unit, duration] = units.find(([, duration]) => Math.abs(seconds) >= duration) ?? ['second', 1];
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(seconds / duration), unit);
      },
    }),
    [locale, now],
  );
}
