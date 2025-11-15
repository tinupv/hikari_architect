
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen } from '../types';
import { ActionButton, RatioButton, Spinner, TooltipWrapper, Slider, SettingItemWithTooltip } from '../components/ui';
import { DownloadIcon, ImageIcon, InfoIcon, SparklesIcon } from '../components/icons';

interface ImageGenerationScreenProps {
    onNavigate: (screen: Screen) => void;
    apiKeySelected: boolean;
    handleSelectApiKey: () => void;
    handleGenerate: (prompt: string, numImages: number, aspectRatio: any) => void;
    isLoading: boolean;
    statusMessage: string;
    progress: number;
    imageResults: string[];
}

export const ImageGenerationScreen: React.FC<ImageGenerationScreenProps> = (props) => {
    const [prompt, setPrompt] = useState('A photorealistic image of a futuristic city with flying cars at sunset.');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
    const [numImages, setNumImages] = useState(1);

    const onGenerateClick = () => {
        if (!props.apiKeySelected) {
            alert("Please select your API Key first.");
            return;
        }
        props.handleGenerate(prompt, numImages, aspectRatio);
    }
    
    return (
        <motion.div
            key="imageGeneration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full"
        >
            <div className="lg:col-span-1 space-y-6 flex flex-col">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-300">Image Generation Settings</h3>
                    <div className="space-y-4 flex-grow flex flex-col">
                        <div className="flex-grow">
                             <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Prompt</label>
                             <TooltipWrapper 
                                tooltipText="Describe the image you want to create. Be as descriptive as possible for best results."
                                className="block w-full h-full"
                            >
                                <textarea
                                    id="image-prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={8}
                                    className="w-full h-full resize-none bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800 dark:text-gray-200 placeholder-gray-500"
                                    placeholder="e.g., A majestic white wolf howling at a glowing full moon in a snowy forest."
                                />
                            </TooltipWrapper>
                        </div>
                        <SettingItemWithTooltip
                            label={`Number of Images: ${numImages}`}
                            tooltipText="Select how many images to generate at once (1-4)."
                        >
                            <Slider value={numImages} onChange={(e) => setNumImages(parseInt(e.target.value, 10))} min={1} max={4} step={1} />
                        </SettingItemWithTooltip>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Aspect Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                                <RatioButton label="1:1" value="1:1" selected={aspectRatio} setSelected={setAspectRatio} />
                                <RatioButton label="16:9" value="16:9" selected={aspectRatio} setSelected={setAspectRatio} />
                                <RatioButton label="9:16" value="9:16" selected={aspectRatio} setSelected={setAspectRatio} />
                                <RatioButton label="4:3" value="4:3" selected={aspectRatio} setSelected={setAspectRatio} />
                                <RatioButton label="3:4" value="3:4" selected={aspectRatio} setSelected={setAspectRatio} />
                            </div>
                        </div>
                    </div>
                     <div className="mt-6">
                        {!props.apiKeySelected ? (
                            <div className="p-4 bg-teal-50 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700/50 rounded-lg text-center">
                                <InfoIcon className="w-8 h-8 mx-auto text-teal-500 dark:text-teal-400 mb-2"/>
                                <p className="text-sm text-teal-800 dark:text-teal-300 mb-3">Image generation requires an API Key.</p>
                                <p className="text-xs text-teal-600 dark:text-teal-500 mb-3">This feature uses a model that may require billing. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-700 dark:hover:text-teal-300">Learn more</a>.</p>
                                <TooltipWrapper tooltipText="An API key is required for image generation. This opens a dialog to select your key.">
                                    <ActionButton onClick={props.handleSelectApiKey} label="Select API Key"/>
                                </TooltipWrapper>
                            </div>
                        ) : (
                            <TooltipWrapper tooltipText="Starts the image generation process." className="block w-full">
                                <ActionButton onClick={onGenerateClick} disabled={props.isLoading || !prompt} icon={<SparklesIcon className="w-5 h-5" />} label="Generate Images" className="w-full" />
                            </TooltipWrapper>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col h-[75vh]">
                <div className="flex-grow bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <AnimatePresence>
                        {props.isLoading && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4 text-center px-4">
                                <Spinner />
                                <p className="text-gray-200 dark:text-gray-400 font-medium">{props.statusMessage}</p>
                            </motion.div>
                        )}
                        {props.imageResults.length > 0 ? (
                            <div className="w-full h-full p-4 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {props.imageResults.map((imgSrc, index) => (
                                        <motion.div
                                            key={index}
                                            className="relative group rounded-lg overflow-hidden"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <img src={imgSrc} alt={`Generated image ${index + 1}`} className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <a href={imgSrc} download={`hikari-image-${index + 1}.png`}>
                                                    <ActionButton icon={<DownloadIcon className="w-5 h-5" />} label="Download" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            !props.isLoading && (
                                <div className="text-center text-gray-500">
                                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                                    <h3 className="text-lg font-semibold">Your Generated Images Will Appear Here</h3>
                                    <p className="text-sm">Write a prompt and click 'Generate' to begin.</p>
                                </div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
