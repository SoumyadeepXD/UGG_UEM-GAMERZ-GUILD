import { DEF } from '@/data/uggContent';

export type UggContent = typeof DEF;

export const merge = (a: unknown, b: unknown): unknown => {
  if (Array.isArray(a) || typeof a !== 'object' || a === null) return b === undefined ? a : b;
  const o: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  const bRecord = (b as Record<string, unknown>) || {};
  for (const k in bRecord) {
    o[k] = merge((a as Record<string, unknown>)[k], bRecord[k]);
  }
  return o;
};

export const sha = async (t: string): Promise<string> => {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return '';
  }
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ugg:' + t)))]
    .map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const load = (): UggContent => {
  if (typeof window === 'undefined') return structuredClone(DEF);
  try {
    const raw = localStorage.getItem('ugg-content');
    return raw ? (merge(DEF, JSON.parse(raw)) as UggContent) : structuredClone(DEF);
  } catch {
    return structuredClone(DEF);
  }
};

export const save = (c: UggContent): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ugg-content', JSON.stringify(c));
    window.dispatchEvent(new Event('ugg-storage-update'));
  }
};
