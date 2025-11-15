import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Screen } from '../types';
import { Logo } from '../components/logo';
import { ActionButton, ButtonSpinner } from '../components/ui';
import { GoogleIcon } from '../components/icons';

interface LoginScreenProps {
    onNavigate: (screen: Screen) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        
        // Simulate API call
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onNavigate('welcome');
        }, 1500);
    };

    const handleGoogleLogin = () => {
        setError('');
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onNavigate('welcome');
        }, 1500);
    };

    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col items-center justify-center"
        >
            <motion.div 
                className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            >
                <div className="text-center">
                    <Logo className="h-16 w-16 mx-auto text-gray-800 dark:text-gray-200" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 tracking-tight mt-4">
                        Sign in to your account
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        to access AI features and Gemini services
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password-sr-only" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <ActionButton
                            type="submit"
                            label={isLoading ? 'Signing in...' : 'Sign In'}
                            disabled={isLoading}
                            icon={isLoading ? <ButtonSpinner /> : null}
                            className="w-full justify-center !py-3"
                        />
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div>
                     <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        Sign in with Google
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};