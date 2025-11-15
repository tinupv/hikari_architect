
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageFile, Screen } from '../types';
import { ActionButton, FileUploadCard, RatioButton, Spinner, TooltipWrapper } from '../components/ui';
import { DownloadIcon, FilmIcon, InfoIcon } from '../components/icons';

interface AnimateScreenProps {
    onNavigate: (screen: Screen) => void;
    animateFile: ImageFile | null;
    onAnimateFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    animatePrompt: string;
    setAnimatePrompt: React.Dispatch<React.SetStateAction<string>>;
    aspectRatio: '16:9' | '9:16';
    setAspectRatio: React.Dispatch<React.SetStateAction<'16:9' | '9:16'>>;
    apiKeySelected: boolean;
    handleSelectApiKey: () => void;
    handleAnimate: () => void;
    isLoading: boolean;
    statusMessage: string;
    progress: number;
    videoResult: string | null;
}

export const AnimateScreen: React.FC<AnimateScreenProps> = (props) => {
    return (
        <motion.div
            key="animate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full"
        >
            <div className="lg:col-span-1 space-y-6">
                <FileUploadCard 
                    title="1. Upload Image" 
                    description="Upload the image you want to animate (JPG, PNG)."
                    file={props.animateFile}
                    onFileChange={props.onAnimateFileChange}
                />
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-300">2. Animation Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="animate-prompt" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Prompt</label>
                            <TooltipWrapper 
                                tooltipText="Describe the desired motion or transformation. E.g., 'make the clouds move slowly' or 'a gentle zoom-in effect'."
                                className="block w-full"
                            >
                                <textarea
                                    id="animate-prompt"
                                    value={props.animatePrompt}
                                    onChange={(e) => props.setAnimatePrompt(e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800 dark:text-gray-200 placeholder-gray-500"
                                />
                            </TooltipWrapper>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Aspect Ratio</label>
                            <div className="flex space-x-2">
                                <TooltipWrapper tooltipText="Landscape format (16:9), ideal for desktop and TV screens." className="flex-1">
                                    <RatioButton label="16:9" value="16:9" selected={props.aspectRatio} setSelected={props.setAspectRatio} />
                                </TooltipWrapper>
                                <TooltipWrapper tooltipText="Portrait format (9:16), ideal for mobile phones." className="flex-1">
                                    <RatioButton label="9:16" value="9:16" selected={props.aspectRatio} setSelected={props.setAspectRatio} />
                                </TooltipWrapper>
                            </div>
                        </div>
                        
                            {!props.apiKeySelected ? (
                            <div className="!mt-6 p-4 bg-teal-50 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700/50 rounded-lg text-center">
                                <InfoIcon className="w-8 h-8 mx-auto text-teal-500 dark:text-teal-400 mb-2"/>
                                <p className="text-sm text-teal-800 dark:text-teal-300 mb-3">Video generation requires an API Key. Please select one to proceed.</p>
                                    <p className="text-xs text-teal-600 dark:text-teal-500 mb-3">This feature uses a model that may require billing. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-700 dark:hover:text-teal-300">Learn more about billing</a>.</p>
                                <TooltipWrapper tooltipText="An API key is required for video generation. This opens a dialog to select your key.">
                                    <ActionButton onClick={props.handleSelectApiKey} label="Select API Key"/>
                                </TooltipWrapper>
                            </div>
                        ) : (
                                <TooltipWrapper tooltipText="Starts the video generation process. This may take several minutes." className="block w-full !mt-6">
                                    <ActionButton onClick={props.handleAnimate} disabled={props.isLoading || !props.animateFile} icon={<FilmIcon className="w-5 h-5" />} label="Generate Video" className="w-full" />
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
                                <div className="w-1/2 bg-gray-700 rounded-full h-2.5">
                                <motion.div 
                                    className="bg-teal-500 h-2.5 rounded-full" 
                                    style={{ width: `${props.progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>
                    )}
                    {props.videoResult ? (
                        <motion.video
                            key={props.videoResult}
                            src={props.videoResult}
                            controls
                            autoPlay
                            loop
                            className="max-w-full max-h-full object-contain"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                    ) : (
                        <div className="text-center text-gray-500">
                            <FilmIcon className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                            <h3 className="text-lg font-semibold">Your Generated Video Will Appear Here</h3>
                            <p className="text-sm">Upload an image and prompt to begin.</p>
                        </div>
                    )}
                    </AnimatePresence>
                </div>
                {props.videoResult && (
                    <div className="mt-4 flex justify-end">
                        <TooltipWrapper tooltipText="Saves the generated video to your device as an MP4 file.">
                             <a href={props.videoResult} download="hikari-video.mp4">
                                <ActionButton disabled={props.isLoading} icon={<DownloadIcon className="w-5 h-5" />} label="Download Video" />
                            </a>
                        </TooltipWrapper>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
