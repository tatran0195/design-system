import { useSearchParams } from '../routing';
export function useQueryParams<T extends string>(keys: readonly T[], prefix?: string): Record<T, string | undefined> {
  const [params] = useSearchParams();
  return Object.fromEntries(keys.map((key) => [key, params.get(prefix ? `${prefix}_${key}` : key) ?? undefined])) as Record<T, string | undefined>;
}
export function parseJsonQuery<T>(value: string | undefined, validate?: (value: unknown) => value is T): T | undefined {
  if (value === undefined) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return !validate || validate(parsed) ? (parsed as T) : undefined;
  } catch {
    return undefined;
  }
}
export function parseNonNegativeInteger(value: string | undefined, fallback = 0): number {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}
