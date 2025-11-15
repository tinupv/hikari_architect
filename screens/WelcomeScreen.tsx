

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildingIcon, FilmIcon, ImageIcon } from '../components/icons';
import { Screen } from '../types';
import { Logo } from '../components/logo';
import { ActionButton } from '../components/ui';

interface WelcomeScreenProps {
    onNavigate: (screen: Screen) => void;
}

const WelcomeCard: React.FC<{ icon: React.ReactNode, title: string, description: string, onClick: () => void }> = ({ icon, title, description, onClick }) => (
    <motion.div
        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' }}
        transition={{ type: 'spring', stiffness: 300 }}
        onClick={onClick}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl cursor-pointer border border-gray-200 dark:border-gray-700/50 flex flex-col items-center text-center shadow-lg"
    >
        {icon}
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
    const [showChoices, setShowChoices] = useState(false);

    const viewVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
        exit: { opacity: 0, y: -30, scale: 0.98, transition: { duration: 0.3, ease: 'easeIn' } }
    };

    return (
        <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col items-center justify-center"
        >
            <AnimatePresence mode="wait">
                {!showChoices ? (
                    <motion.div
                        key="landing"
                        variants={viewVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="text-center flex flex-col items-center"
                    >
                        <Logo className="h-28 w-28 text-gray-800 dark:text-gray-200" />
                        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-200 tracking-tight mt-6">
                            HIKARI RENDER STUDIO
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl">
                            AI-powered architectural visualization and animation. Turn your vision into reality.
                        </p>
                        <div className="mt-12">
                            <ActionButton
                                label="Start Creating"
                                onClick={() => setShowChoices(true)}
                                className="px-8 py-4 text-lg font-semibold"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="choices"
                        variants={viewVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-full"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-200">What would you like to create?</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Choose an option to begin your next project.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                            <WelcomeCard
                                icon={<BuildingIcon className="w-12 h-12 text-teal-400 mb-4" />}
                                title="Create 3D Render"
                                description="Transform 2D architectural plans into photorealistic 3D visualizations."
                                onClick={() => onNavigate('renderUpload')}
                            />
                            <WelcomeCard
                                icon={<ImageIcon className="w-12 h-12 text-teal-400 mb-4" />}
                                title="Generate an Image"
                                description="Create stunning visuals from simple text descriptions using AI."
                                onClick={() => onNavigate('imageGeneration')}
                            />
                            <WelcomeCard
                                icon={<FilmIcon className="w-12 h-12 text-teal-400 mb-4" />}
                                title="Animate an Image"
                                description="Bring your static images to life by generating captivating video animations."
                                onClick={() => onNavigate('animate')}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};