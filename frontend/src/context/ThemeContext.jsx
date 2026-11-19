import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'intervue-theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    let initialTheme = 'day';
    try {
      initialTheme = localStorage.getItem(STORAGE_KEY) === 'night' ? 'night' : 'day';
    } catch { /* Use the shared day palette when storage is unavailable. */ }
    if (typeof document !== 'undefined') document.documentElement.dataset.theme = initialTheme;
    return initialTheme;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme: () => setTheme((current) => current === 'night' ? 'day' : 'night') }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
