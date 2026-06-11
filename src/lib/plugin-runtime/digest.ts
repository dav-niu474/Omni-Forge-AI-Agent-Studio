/**
 * Manifest Digest — Borrowed from Open Design's `manifestSourceDigest()`.
 *
 * OD Pattern: Frozen `manifestSourceDigest` algorithm (plan F1). The input shape
 * is stable forever: bumping it requires a CI fixture update so historic snapshots
 * cannot silently drift.
 *
 * Algorithm:
 *   1. Build a canonical record { manifest, inputs, resolvedContextRefs }.
 *   2. JSON.stringify with object keys sorted alphabetically, arrays in source order.
 *   3. SHA-256 the resulting UTF-8 bytes; emit lower-case hex.
 *
 * Note: Uses the Web Crypto API (SubtleCrypto) for portability across
 * Node.js and browser environments, unlike OD's `node:crypto` import.
 * In Node.js 20+, `crypto.subtle` is available globally.
 */

import type { PluginManifest } from '@/lib/contracts/plugins/manifest';

export interface DigestInput {
  manifest: PluginManifest;
  inputs: Record<string, string | number | boolean>;
  resolvedContextRefs: Array<{ kind: string; ref: string }>;
}

/**
 * Compute a SHA-256 digest of the manifest + inputs + resolved context refs.
 * The digest is deterministic: same inputs always produce the same hex string.
 */
export async function manifestSourceDigest(input: DigestInput): Promise<string> {
  const canonical = canonicalize({
    manifest: input.manifest,
    inputs: input.inputs,
    resolvedContextRefs: input.resolvedContextRefs,
  });
  const json = JSON.stringify(canonical);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous version using Node.js crypto for daemon-side use.
 * Falls back to a simple hash if crypto is not available.
 */
export function manifestSourceDigestSync(input: DigestInput): string {
  const canonical = canonicalize({
    manifest: input.manifest,
    inputs: input.inputs,
    resolvedContextRefs: input.resolvedContextRefs,
  });
  const json = JSON.stringify(canonical);
  // Use dynamic import pattern for Node.js crypto
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('node:crypto');
    return nodeCrypto.createHash('sha256').update(json, 'utf8').digest('hex');
  } catch {
    // Fallback: simple deterministic hash for environments without node:crypto
    return simpleHash(json);
  }
}

/**
 * Canonicalize a value for deterministic JSON serialization.
 * Sorts object keys alphabetically, preserves array order.
 */
function canonicalize(value: unknown): unknown {
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value !== 'object') return value;
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    out[key] = canonicalize(obj[key]);
  }
  return out;
}

/**
 * Simple deterministic hash for environments without crypto.
 * Not cryptographically secure, but deterministic.
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
