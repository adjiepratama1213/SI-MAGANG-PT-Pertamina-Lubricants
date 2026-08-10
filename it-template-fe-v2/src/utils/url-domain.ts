// src/utils/url.ts

/**
 * Normalize a host string by stripping protocol, port, and trailing slashes.
 * Handles:
 * - "http://localhost:3000/"       → "localhost"
 * - "localhost:3000"              → "localhost"
 * - "https://dev.example.com:443" → "dev.example.com"
 * - "example.com"                 → "example.com"
 */
function normalizeHost(host: string): string {
  return host
    .replace(/^https?:\/\//, '')   // remove protocol if exists
    .replace(/\/$/, '')           // remove trailing slash
    .replace(/:\d+$/, '');        // remove port (even without protocol)
}

/**
 * Extract subdomain or domain part from a hostname.
 */
export function parseSubdomainOrDomain(hostname: string): string | null {
  if (!hostname) return null;

  const parts = hostname.split('.');

  if (parts.length === 1) {
    // e.g. "localhost"
    return parts[0];
  }

  if (parts.length === 2) {
    // e.g. "example.com"
    return parts[0];
  }

  // e.g. "dev.example.com" or "staging.dev.example.com"
  return parts[0];
}

/**
 * Get subdomain or domain from current browser URL.
 */
export function getCurrentSubdomainOrDomain(): string | null {
  return parseSubdomainOrDomain(window.location.hostname);
}

/**
 * Get subdomain or domain from a host string (e.g. env HOST).
 */
export function getEnvSubdomainOrDomain(envHost?: string): string | null {
  if (!envHost) return null;
  const cleaned = normalizeHost(envHost);
  return parseSubdomainOrDomain(cleaned);
}

/**
 * Compare current browser hostname with env host (after normalization).
 */
export function isSameSubdomainOrDomain(envHost?: string): boolean {
  const current = getCurrentSubdomainOrDomain();
  const env = getEnvSubdomainOrDomain(envHost);
  return current === env;
}
