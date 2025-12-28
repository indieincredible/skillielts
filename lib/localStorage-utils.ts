/**
 * Utility functions for localStorage with TTL (Time To Live) support
 */

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Set an item in localStorage with TTL (default 7 days)
 */
export function setItemWithTTL(key: string, value: unknown, ttlMs?: number): void {
  const payload = {
    value,
    expiresAt: Date.now() + (ttlMs || SEVEN_DAYS_MS),
  };
  localStorage.setItem(key, JSON.stringify(payload));
}

/**
 * Get an item from localStorage with TTL check
 * Returns null if expired or not found
 */
export function getItemWithTTL<T = unknown>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (typeof data?.expiresAt !== 'number') return null;

    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return data.value as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeItemWithTTL(key: string): void {
  localStorage.removeItem(key);
}






