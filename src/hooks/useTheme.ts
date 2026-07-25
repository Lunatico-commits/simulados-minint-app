import { useState, useEffect } from "react";

export type ThemeMode = "auto" | "dark" | "light";

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("minint_theme_mode");
    return (saved as ThemeMode) || "auto";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let currentTheme: "dark" | "light";
      if (themeMode === "auto") {
        currentTheme = mediaQuery.matches ? "dark" : "light";
      } else {
        currentTheme = themeMode;
      }

      setResolvedTheme(currentTheme);

      if (currentTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    };

    applyTheme();

    const handleChange = () => {
      if (themeMode === "auto") {
        applyTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [themeMode]);

  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("minint_theme_mode", mode);
  };

  return { themeMode, resolvedTheme, changeThemeMode };
}
