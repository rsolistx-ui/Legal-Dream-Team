// Theme handling. Default dark, optional light. Persisted to localStorage.
const KEY = "legalDreamTeam.theme";

export type Theme = "dark" | "light";

export function getStoredTheme(): Theme {
  const v = localStorage.getItem(KEY);
  return v === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
}

export function applyStoredTheme(): void {
  applyTheme(getStoredTheme());
}
