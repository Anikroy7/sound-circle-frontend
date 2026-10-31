export const themes = ["system", "light", "dark"] as const;

export type Theme = (typeof themes)[number];

const STORAGE_KEY = "sc-theme";

/**
 * Runs in <head> before first paint so a saved choice never flashes the wrong palette.
 * "system" is the absence of `data-theme`; the CSS then follows `prefers-color-scheme`.
 */
export const themeInitScript = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const isTheme = (value: unknown): value is Theme => themes.includes(value as Theme);

/** The `data-theme` attribute is the source of truth: the init script and `setTheme` both write it. */
export function readTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : "system";
}

function applyTheme(theme: Theme): void {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

const listeners = new Set<() => void>();

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the choice still applies for this page view.
  }
  listeners.forEach((listener) => listener());
}

/** `useSyncExternalStore` subscriber; also follows a theme changed in another tab. */
export function subscribeTheme(listener: () => void): () => void {
  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return;
    applyTheme(isTheme(event.newValue) ? event.newValue : "system");
    listener();
  };

  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
