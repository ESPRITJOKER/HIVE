"use client";

import * as React from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "hive-theme";
const CHANGE_EVENT = "hive-theme-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// The inline bootstrap script in the root layout sets data-theme before paint.
function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

/** Theme controller: CSS token swapping via data-theme on <html>. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = React.useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(getSnapshot() === "light" ? "dark" : "light");
  }, [setTheme]);

  const value = React.useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
