import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
                return storedTheme;
            }
        }
        return 'system'; // Default to system preference
    });

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const systemIsDark = mediaQuery.matches;

            if (savedTheme === 'dark' || (savedTheme === 'system' && systemIsDark)) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.remove('dark');
                root.classList.add('light');
            }
        };
        
        // Apply theme on component mount and when the theme state changes
        localStorage.setItem('theme', theme);
        applyTheme();

        // Listen for changes in system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', applyTheme);

        // Cleanup listener on component unmount
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => {
            if (prevTheme === 'light') return 'dark';
            if (prevTheme === 'dark') return 'system';
            return 'light'; // from 'system'
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
