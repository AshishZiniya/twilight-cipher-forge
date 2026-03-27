import { useEffect } from "react";

const useThemeInit = () => {
  useEffect(() => {
    const stored = localStorage.getItem("xencoder-theme");
    if (stored === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      if (!stored) localStorage.setItem("xencoder-theme", "dark");
    }
  }, []);
};

export const toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("xencoder-theme", isDark ? "dark" : "light");
};

export const isDarkMode = () => document.documentElement.classList.contains("dark");

export default useThemeInit;
