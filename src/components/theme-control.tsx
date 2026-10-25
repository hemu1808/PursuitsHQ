"use client";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { resolvedTheme, validTheme, type ColorTheme } from "../lib/color-theme";

export default function ThemeControl({ storageKey }: { storageKey: string }) {
  const [preference, setPreference] = useState<ColorTheme>("light");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (value: ColorTheme) => {
      const theme = resolvedTheme(value, media.matches);
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.themePreference = value;
      document.documentElement.style.colorScheme = theme;
      setPreference(value);
    };
    try { const stored = localStorage.getItem(storageKey); apply(validTheme(stored === null ? document.documentElement.dataset.themePreference : stored)); }
    catch { apply(validTheme(document.documentElement.dataset.themePreference)); }
    const systemChanged = () => {
      if (document.documentElement.dataset.themePreference === "system") apply("system");
    };
    const storedChanged = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) apply(validTheme(event.newValue));
    };
    media.addEventListener("change", systemChanged);
    window.addEventListener("storage", storedChanged);
    return () => { media.removeEventListener("change", systemChanged); window.removeEventListener("storage", storedChanged); };
  }, [storageKey]);

  function change(value: ColorTheme) {
    const theme = resolvedTheme(value, window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = value;
    document.documentElement.style.colorScheme = theme;
    setPreference(value);
    try { localStorage.setItem(storageKey, value); } catch { /* The selected theme remains usable for this session. */ }
  }
  const Icon = preference === "system" ? Monitor : preference === "dark" ? Moon : Sun;
  return <label className="theme-control" title="Color theme · remembered in this browser"><Icon size={16} aria-hidden="true" /><select aria-label="Color theme" value={preference} onChange={event => change(validTheme(event.target.value))}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label>;
}
