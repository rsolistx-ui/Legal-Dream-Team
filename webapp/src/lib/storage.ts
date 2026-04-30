// Typed localStorage wrapper, namespaced under legalDreamTeam.

const NS = "legalDreamTeam.";

type Listener<T> = (value: T | null) => void;
const listeners = new Map<string, Set<Listener<unknown>>>();

function fullKey(key: string): string {
  return NS + key;
}

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(fullKey(key));
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(fullKey(key), JSON.stringify(value));
  const set = listeners.get(key);
  if (set) {
    set.forEach((fn) => fn(value));
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(fullKey(key));
  const set = listeners.get(key);
  if (set) {
    set.forEach((fn) => fn(null));
  }
}

export function subscribe<T>(key: string, fn: Listener<T>): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(fn as Listener<unknown>);
  return () => {
    set!.delete(fn as Listener<unknown>);
  };
}

export function exportAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(NS)) continue;
    const short = k.slice(NS.length);
    try {
      out[short] = JSON.parse(localStorage.getItem(k) ?? "null");
    } catch {
      out[short] = localStorage.getItem(k);
    }
  }
  return out;
}

export function importAll(data: Record<string, unknown>): void {
  Object.entries(data).forEach(([k, v]) => {
    setItem(k, v);
  });
}

export function clearAll(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(NS)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
  listeners.forEach((set, key) => {
    set.forEach((fn) => fn(null));
    listeners.set(key, set);
  });
}
