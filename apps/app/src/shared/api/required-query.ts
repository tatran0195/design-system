/** Narrow an enabled query's required identifier without an assertion. */
export function requireQueryValue(value: string | undefined, label: string): string {
  if (!value) throw new Error(`${label} is required`);
  return value;
}
