import { timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { serverEnv } from '@/integrations/nibleaf/env.server';

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const _IPV6 = /^[0-9a-f:]+$/i;

const normalizeIp = (raw: string): string => {
  let value = raw.trim().toLowerCase();
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(value);
  if (bracketed?.[1]) {
    value = bracketed[1];
  } else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(value)) {
    value = value.slice(0, value.lastIndexOf(':'));
  }
  const zone = value.indexOf('%');
  return zone === -1 ? value : value.slice(0, zone);
};

const isValidIp = (value: string): boolean => isIP(value) !== 0;

const isPrivateIp = (ip: string): boolean => {
  const value = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  const v4 = IPV4.exec(value);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  const first = Number.parseInt(value.split(':')[0] ?? '', 16);
  return value === '::1' || value === '::' || (first & 0xfe_00) === 0xfc_00 || (first & 0xff_c0) === 0xfe_80;
};

/** Public edge hops appended by infrastructure the operator runs (e.g. 1 behind
 *  Cloudflare). Must match the API's TRUSTED_PROXY_HOPS. */

/** Rightmost-untrusted hop of an x-forwarded-for chain — mirrors the API's
 *  apps/server/src/lib/client-ip.ts (kept in sync manually; this entry cannot
 *  import from the server package). Leftmost hops are client-supplied because
 *  proxies APPEND, so trusting them would let a visitor forge a new identity
 *  per request. */
export const clientIpFromForwardedFor = (header: string | null, trustedHops = serverEnv.TRUSTED_PROXY_HOPS): string | null => {
  if (!Number.isInteger(trustedHops) || trustedHops <= 0) return null;
  if (!header) {
    return null;
  }
  const hops = header
    .split(',')
    .map((hop) => normalizeIp(hop))
    .filter((hop) => hop.length > 0 && hop !== 'unknown' && isValidIp(hop));
  if (hops.length === 0) {
    return null;
  }
  const candidates = hops.slice(0, Math.max(1, hops.length - trustedHops));
  for (let i = candidates.length - 1; i >= 0; i--) {
    const hop = candidates[i];
    if (!hop) continue;
    if (!isPrivateIp(hop)) {
      return hop;
    }
  }
  return candidates.at(-1) ?? null;
};

// Cloudflare for SaaS terminates customer TLS at the edge and proxies every
// vanity hostname to one DNS-only origin. Trust the original hostname only
// when the Worker proves it with a server-only shared secret.
const CUSTOM_DOMAIN_EDGE_SECRET = serverEnv.CUSTOM_DOMAIN_EDGE_SECRET ?? '';
export const safeSecretMatch = (left: string, right: string): boolean => {
  if (!(left && right)) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

export const effectiveRequestHost = (request: Request, url: URL): string => {
  const edgeSecret = request.headers.get('x-nibleaf-edge-secret') || '';
  const edgeHost = request.headers.get('x-nibleaf-custom-host')?.trim().toLowerCase() || '';
  if (safeSecretMatch(edgeSecret, CUSTOM_DOMAIN_EDGE_SECRET) && /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(edgeHost)) {
    return edgeHost;
  }
  return (request.headers.get('host') || url.host).toLowerCase();
};
