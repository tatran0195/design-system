import { z } from 'zod';
/** Navigation/download/upload URLs must not turn server data into script execution. */
export const safeUrlSchema = z.string().refine((value) => {
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return false;
  if (value.startsWith('/')) return !value.startsWith('//');
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}, 'Unsafe response URL');
