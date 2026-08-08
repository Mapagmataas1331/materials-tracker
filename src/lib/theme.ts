/** Must match ThemeProvider storageKey. */
export const THEME_STORAGE_KEY = "theme";

/**
 * Blocking inline script for <head>. Applies the saved/system theme before
 * first paint so dark-mode users don't get a light flash on load.
 */
export function themeInitScript(storageKey = THEME_STORAGE_KEY) {
  return `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)})||"system";var r=t==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t;var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(r);e.style.colorScheme=r}catch(n){}})();`;
}
