import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, DesktopIcon } from './icons';
import { AnimatePresence, motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative p-2 w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-teal-400 transition-colors duration-200 overflow-hidden"
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === 'system' && (
                    <motion.div key="sun" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <SunIcon className="w-5 h-5" />
                    </motion.div>
                )}
                {theme === 'light' && (
                    <motion.div key="moon" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <MoonIcon className="w-5 h-5" />
                    </motion.div>
                )}
                 {theme === 'dark' && (
                    <motion.div key="desktop" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <DesktopIcon className="w-5 h-5" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
};
