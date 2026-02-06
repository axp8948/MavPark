import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ isDarkMode: false, setIsDarkMode: () => {} });

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mavpark-darkMode") === "true";
  });

  // Sync theme to <html> and localStorage whenever isDarkMode changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("mavpark-darkMode", String(isDarkMode));
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
