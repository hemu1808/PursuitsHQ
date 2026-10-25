export type ColorTheme = "light" | "dark" | "system";
export function validTheme(value: unknown): ColorTheme {
  return value === "dark" || value === "system" ? value : "light";
}
export function resolvedTheme(preference: ColorTheme, systemDark: boolean): "light" | "dark" {
  return preference === "dark" || preference === "system" && systemDark ? "dark" : "light";
}
// This small, synchronous script runs in the document head before the first paint.
// Only a project-owned storage key is interpolated; user content is never included.
export function themeInitialization(storageKey: string) {
  return `(function(){var p="light";try{var s=localStorage.getItem(${JSON.stringify(storageKey)});if(s==="light"||s==="dark"||s==="system")p=s}catch(e){}var d=document.documentElement;var dark=p==="dark"||(p==="system"&&typeof matchMedia==="function"&&matchMedia("(prefers-color-scheme: dark)").matches);d.dataset.theme=dark?"dark":"light";d.dataset.themePreference=p;d.style.colorScheme=dark?"dark":"light"})();`;
}
