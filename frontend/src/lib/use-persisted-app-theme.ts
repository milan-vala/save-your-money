import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sym-app-appearance";

function readStoredIsDark(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light") {
      return false;
    }
    if (raw === "dark") {
      return true;
    }
  } catch {
    // private mode / storage disabled
  }
  return true;
}

function persistIsDark(isDark: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  } catch {
    // ignore
  }
}

/**
 * Appearance for Radix `Theme` — persisted so switching between `AppLayout` and
 * `AppFullWidthLayout` (different route trees) does not reset light/dark.
 */
export function usePersistedAppTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => readStoredIsDark());

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || event.newValue == null) {
        return;
      }
      setIsDark(event.newValue === "dark");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      persistIsDark(next);
      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}
