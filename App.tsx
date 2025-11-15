import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generate3dRender, editImage, generateVideo, generateImages } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import type { Settings, Screen, ImageFile, BatchJob } from './types';
import { HomeIcon } from './components/icons';
import { Logo } from './components/logo';
import { ThemeToggle } from './components/ThemeToggle';

import { WelcomeScreen } from './screens/WelcomeScreen';
import { RenderUploadScreen } from './screens/RenderUploadScreen';
import { RenderMainScreen } from './screens/RenderMainScreen';
import { AnimateScreen } from './screens/AnimateScreen';
import { ImageGenerationScreen } from './screens/ImageGenerationScreen';

const App: React.FC = () => {
    const splashText = "HIKARI RENDER STUDIO";
    const sentence = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.4,
                staggerChildren: 0.08,
            },
        },
    };

    const letter = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { ease: "easeOut", duration: 0.5 }
        },
    };

    const [showWelcome, setShowWelcome] = useState(true);
    const [screen, setScreen] = useState<Screen>('welcome');

    const [planFile, setPlanFile] = useState<ImageFile | null>(null);
    const [styleFiles, setStyleFiles] = useState<ImageFile[]>([]);
    const [animateFile, setAnimateFile] = useState<ImageFile | null>(null);

    const [renderResult, setRenderResult] = useState<string | null>(null);
    const [editHistory, setEditHistory] = useState<string[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
    const [videoResult, setVideoResult] = useState<string | null>(null);
    const [imageResults, setImageResults] = useState<string[]>([]);

    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const [editPrompt, setEditPrompt] = useState<string>('');
    const [animatePrompt, setAnimatePrompt] = useState<string>('Animate this image with cinematic motion.');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    
    const [apiKeySelected, setApiKeySelected] = useState(false);

    const [settings, setSettings] = useState<Settings>({
        resolution: '2k',
        aspectRatio: '16:9',
        lightingPreset: 'studio',
        lockStructure: true,
        denoising: 0.2,
    });
    
    // Batch Rendering State
    const [batchQueue, setBatchQueue] = useState<BatchJob[]>([]);
    const [isBatchRendering, setIsBatchRendering] = useState(false);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(-1);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 4000); // Increased duration to accommodate new animation
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        if (screen === 'animate' || screen === 'imageGeneration') {
            const checkApiKey = async () => {
                if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                    setApiKeySelected(true);
                } else {
                    setApiKeySelected(false);
                }
            };
            checkApiKey();
        }
    }, [screen]);

    // Batch Rendering Logic
    useEffect(() => {
        const processQueue = async () => {
            if (!isBatchRendering || currentBatchIndex < 0 || currentBatchIndex >= batchQueue.length) {
                if (isBatchRendering) { // Batch finished
                    setIsBatchRendering(false);
                    setCurrentBatchIndex(-1);
                    setStatusMessage('Batch rendering complete!');
                }
                return;
            }
            
            if (!planFile) {
                setStatusMessage('Error: Plan file is missing. Stopping batch.');
                setIsBatchRendering(false);
                setBatchQueue(prev => prev.map(j => ({...j, status: j.status === 'rendering' ? 'failed' : j.status})))
                return;
            }

            const job = batchQueue[currentBatchIndex];
            
            setBatchQueue(prev => prev.map(j => j.id === job.id ? { ...j, status: 'rendering' } : j));
            setStatusMessage(`Batch rendering job ${currentBatchIndex + 1} of ${batchQueue.length}...`);
            setProgress(10);
            
            try {
                setProgress(30);
                const result = await generate3dRender(
                    { base64: planFile.base64, mimeType: planFile.file.type },
                    job.styleFiles.map(f => ({ base64: f.base64, mimeType: f.file.type, weight: f.weight ?? 1.0 })),
                    job.settings
                );
                setProgress(90);

                setBatchQueue(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', result } : j));
                
                // Show the result of the last successful render in the main view
                setRenderResult(result);
                setEditHistory([result]);
                setCurrentHistoryIndex(0);

            } catch (error) {
                console.error(`Batch job ${job.id} failed:`, error);
                setBatchQueue(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed' } : j));
                setStatusMessage(`Job ${currentBatchIndex + 1} failed. See console for details.`);
            } finally {
                setProgress(100);
                setTimeout(() => setCurrentBatchIndex(prevIndex => prevIndex + 1), 1000);
            }
        };

        processQueue();
    }, [isBatchRendering, currentBatchIndex, batchQueue.length, planFile]);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setFileState: React.Dispatch<React.SetStateAction<ImageFile | null>>) => {
        const file = e.target.files?.[0];
        const target = e.target;
        
        if (!file) {
            target.value = '';
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        const base64 = await fileToBase64(file);
        
        setFileState(prevFile => {
            if (prevFile) {
                URL.revokeObjectURL(prevFile.previewUrl);
            }
            return { file, previewUrl, base64 };
        });
        target.value = '';
    };

    const handleMultiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newImageFiles: ImageFile[] = await Promise.all(
            Array.from(files).map(async (file: File) => {
                const previewUrl = URL.createObjectURL(file);
                const base64 = await fileToBase64(file);
                return { file, previewUrl, base64, weight: 1.0 };
            })
        );
        e.target.value = ''; 
        setStyleFiles(currentFiles => [...currentFiles, ...newImageFiles]);
    };
    
    const handleStyleWeightChange = (indexToUpdate: number, newWeight: number) => {
        setStyleFiles(currentFiles =>
            currentFiles.map((file, index) =>
                index === indexToUpdate ? { ...file, weight: newWeight } : file
            )
        );
    };

    const handleRemoveStyleFile = (indexToRemove: number) => {
        URL.revokeObjectURL(styleFiles[indexToRemove].previewUrl);
        setStyleFiles(currentFiles => currentFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleRender = useCallback(async () => {
        if (!planFile) {
            alert("Please upload a 2D plan first.");
            return;
        }
        setIsLoading(true);
        setStatusMessage("Generating 3D render...");
        setProgress(10);
        setRenderResult(null);
        setEditHistory([]);
        setCurrentHistoryIndex(-1);
        setError(null);

        try {
            setProgress(30);
            const result = await generate3dRender(
                { base64: planFile.base64, mimeType: planFile.file.type },
                styleFiles.map(f => ({ base64: f.base64, mimeType: f.file.type, weight: f.weight ?? 1.0 })),
                settings
            );
            setProgress(90);
            setRenderResult(result);
            setEditHistory([result]);
            setCurrentHistoryIndex(0);
            setStatusMessage("Render complete!");
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during render.";
            setStatusMessage(`Render failed.`);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setProgress(100);
            setTimeout(() => setProgress(0), 2000);
        }
    }, [planFile, styleFiles, settings]);

    const handleEnhance = useCallback(async () => {
        const targetImage = editHistory[currentHistoryIndex];

        if (!targetImage || !editPrompt) {
            alert("Please render an image and provide an enhancement prompt first.");
            return;
        }

        setIsLoading(true);
        setStatusMessage("Enhancing image with AI...");
        setProgress(10);
        setError(null);

        try {
            setProgress(30);
            
            const mimeTypeMatch = targetImage.match(/^data:(.+);base64,/);
            if (!mimeTypeMatch) {
                setStatusMessage(`Enhancement failed.`);
                setError("Could not determine the image type for enhancement.");
                setIsLoading(false);
                setProgress(0);
                return;
            }
            const mimeType = mimeTypeMatch[1];
            const base64Data = targetImage.split(',')[1];
            
            const result = await editImage({ base64: base64Data, mimeType }, editPrompt);
            
            const newHistory = editHistory.slice(0, currentHistoryIndex + 1);
            newHistory.push(result);
            setEditHistory(newHistory);
            setCurrentHistoryIndex(newHistory.length - 1);
            
            setStatusMessage("Enhancement complete!");
            setProgress(90);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during enhancement.";
            setStatusMessage(`Enhancement failed.`);
            setError(errorMessage);
            alert(`Enhancement Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setProgress(100);
            setTimeout(() => setProgress(0), 2000);
        }
    }, [editHistory, currentHistoryIndex, editPrompt]);

    const handleUndo = () => {
        if (currentHistoryIndex > 0) {
            setCurrentHistoryIndex(currentHistoryIndex - 1);
            setError(null);
        }
    };

    const handleRedo = () => {
        if (currentHistoryIndex < editHistory.length - 1) {
            setCurrentHistoryIndex(currentHistoryIndex + 1);
            setError(null);
        }
    };

    const handleDownload = () => {
        try {
            const targetImage = editHistory[currentHistoryIndex];
            if (!targetImage) {
                alert("No image to download.");
                return;
            }

            const link = document.createElement('a');
            link.href = targetImage;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `hikari-render-${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Download failed:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred."
            alert(`Could not download the image. Error: ${errorMessage}`);
        }
    };

    const handleAnimate = useCallback(async () => {
        if (!animateFile) {
            alert("Please upload an image to animate.");
            return;
        }

        if (!apiKeySelected) {
            alert("Please select your API Key first.");
            return;
        }

        setIsLoading(true);
        setStatusMessage("Initializing video generation...");
        setVideoResult(null);
        setProgress(0);
        
        const onProgress = (message: string) => {
            setStatusMessage(message);
            setProgress(p => Math.min(95, p + 5));
        };

        try {
            const result = await generateVideo(
                { base64: animateFile.base64, mimeType: animateFile.file.type },
                animatePrompt,
                aspectRatio,
                onProgress
            );
            setVideoResult(result);
            setStatusMessage("Video generation complete!");
            setProgress(100);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setStatusMessage(`Video generation failed: ${errorMessage}`);
            alert(`Video error: ${errorMessage}`);
            if (errorMessage.includes("Requested entity was not found")) {
                setApiKeySelected(false);
                setStatusMessage("API Key invalid. Please select a new key and try again.");
            }
        } finally {
            setIsLoading(false);
            setTimeout(() => setProgress(0), 3000);
        }

    }, [animateFile, animatePrompt, aspectRatio, apiKeySelected]);

    const handleGenerateImages = useCallback(async (prompt: string, numImages: number, aspectRatio: any) => {
        if (!apiKeySelected) {
            alert("Please select your API Key first.");
            return;
        }

        setIsLoading(true);
        setStatusMessage(`Generating ${numImages} image(s)...`);
        setImageResults([]);
        setError(null);
        setProgress(10);

        try {
            const results = await generateImages(prompt, numImages, aspectRatio);
            setImageResults(results);
            setStatusMessage("Image generation complete!");
            setProgress(100);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during image generation.";
            setStatusMessage(`Image generation failed.`);
            setError(errorMessage);
            alert(`Image generation error: ${errorMessage}`);
            if (errorMessage.includes("Requested entity was not found")) {
                setApiKeySelected(false);
                setStatusMessage("API Key invalid. Please select a new key and try again.");
            }
        } finally {
            setIsLoading(false);
            setTimeout(() => setProgress(0), 3000);
        }
    }, [apiKeySelected]);

    const handleSelectApiKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
            setStatusMessage("API Key selected. You can now generate a video.");
        }
    };

    const resetRenderState = () => {
        setPlanFile(null);
        setStyleFiles([]);
        setRenderResult(null);
        setEditHistory([]);
        setCurrentHistoryIndex(-1);
        setError(null);
        setBatchQueue([]);
        setIsBatchRendering(false);
        setCurrentBatchIndex(-1);
    }
    
    const resetAnimateState = () => {
        setAnimateFile(null);
        setVideoResult(null);
    }
    
    const resetImageGenState = () => {
        setImageResults([]);
    }

    const navigate = (newScreen: Screen) => {
        if (newScreen === 'welcome') {
            resetRenderState();
            resetAnimateState();
            resetImageGenState();
        }
        setScreen(newScreen);
    }
    
    const handleAddToBatch = () => {
        const newJob: BatchJob = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            settings: { ...settings },
            styleFiles: [...styleFiles],
            status: 'queued'
        };
        setBatchQueue(prev => [...prev, newJob]);
    }
    const handleRemoveFromBatch = (jobId: string) => {
        setBatchQueue(prev => prev.filter(job => job.id !== jobId));
    }
    const handleClearBatch = () => setBatchQueue([]);
    const handleStartBatchRender = () => {
        if (batchQueue.length > 0 && !isBatchRendering) {
            setIsBatchRendering(true);
            setCurrentBatchIndex(0);
            setRenderResult(null);
            setEditHistory([]);
            setCurrentHistoryIndex(-1);
            setError(null);
        }
    }
    
    const currentRender = editHistory[currentHistoryIndex] || null;

    const renderScreen = () => {
        switch(screen) {
            case 'welcome':
                return <WelcomeScreen key="welcome" onNavigate={navigate} />;
            case 'renderUpload':
                return <RenderUploadScreen 
                    key="renderUpload"
                    onNavigate={navigate}
                    planFile={planFile}
                    styleFiles={styleFiles}
                    onPlanFileChange={(e) => handleFileChange(e, setPlanFile)}
                    onStyleFilesChange={handleMultiFileChange}
                    onStyleFileRemove={handleRemoveStyleFile}
                    onStyleWeightChange={handleStyleWeightChange}
                    onStyleFilesReorder={setStyleFiles}
                />;
            case 'renderMain':
                 return <RenderMainScreen
                    key="renderMain"
                    onNavigate={navigate}
                    planFile={planFile}
                    styleFiles={styleFiles}
                    setStyleFiles={setStyleFiles}
                    settings={settings}
                    setSettings={setSettings}
                    handleRender={handleRender}
                    isLoading={isLoading || isBatchRendering}
                    statusMessage={statusMessage}
                    progress={progress}
                    currentRender={currentRender}
                    renderResult={renderResult}
                    editPrompt={editPrompt}
                    setEditPrompt={setEditPrompt}
                    handleEnhance={handleEnhance}
                    handleUndo={handleUndo}
                    handleRedo={handleRedo}
                    handleDownload={handleDownload}
                    canUndo={currentHistoryIndex > 0}
                    canRedo={currentHistoryIndex < editHistory.length - 1}
                    error={error}
                    setError={setError}
                    // Batch props
                    batchQueue={batchQueue}
                    isBatchRendering={isBatchRendering}
                    currentBatchIndex={currentBatchIndex}
                    addToBatch={handleAddToBatch}
                    removeFromBatch={handleRemoveFromBatch}
                    clearBatch={handleClearBatch}
                    startBatchRender={handleStartBatchRender}
                 />;
            case 'animate':
                return <AnimateScreen 
                    key="animate"
                    onNavigate={navigate}
                    animateFile={animateFile}
                    onAnimateFileChange={(e) => handleFileChange(e, setAnimateFile)}
                    animatePrompt={animatePrompt}
                    setAnimatePrompt={setAnimatePrompt}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    apiKeySelected={apiKeySelected}
                    handleSelectApiKey={handleSelectApiKey}
                    handleAnimate={handleAnimate}
                    isLoading={isLoading}
                    statusMessage={statusMessage}
                    progress={progress}
                    videoResult={videoResult}
                />;
            case 'imageGeneration':
                return <ImageGenerationScreen
                    key="imageGeneration"
                    onNavigate={navigate}
                    apiKeySelected={apiKeySelected}
                    handleSelectApiKey={handleSelectApiKey}
                    handleGenerate={handleGenerateImages}
                    isLoading={isLoading}
                    statusMessage={statusMessage}
                    progress={progress}
                    imageResults={imageResults}
                />;
            default:
                return <WelcomeScreen key="default" onNavigate={navigate} />;
        }
    }

    return (
        <div className="min-h-screen font-sans text-gray-800 dark:text-gray-300 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        key="splash"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50"
                    >
                        <motion.div
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
                        >
                            <Logo className="h-40 w-40 text-gray-200" />
                        </motion.div>
                        <motion.h1
                            className="text-4xl font-bold text-gray-200 tracking-widest mt-4 text-center"
                            variants={sentence}
                            initial="hidden"
                            animate="visible"
                        >
                            {splashText.split("").map((char, index) => (
                                <motion.span key={char + "-" + index} variants={letter}>
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
            {!showWelcome && (
                <motion.div 
                    className="flex flex-col flex-grow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('welcome')}>
                                    <Logo className="h-8 w-8 text-teal-500" />
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">HIKARI RENDER STUDIO</h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                    {screen !== 'welcome' && (
                                        <button
                                            onClick={() => navigate('welcome')}
                                            aria-label="Go to welcome screen"
                                            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-teal-400 transition-colors duration-200"
                                        >
                                            <HomeIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                        <AnimatePresence mode="wait">
                           {renderScreen()}
                        </AnimatePresence>
                    </main>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default App;
