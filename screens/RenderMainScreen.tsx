import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { BatchJob, ImageFile, Screen, Settings } from '../types';
import { Accordion, ActionButton, IconButton, Select, SettingButton, SettingItemWithTooltip, Slider, Spinner } from '../components/ui';
import { BuildingIcon, DownloadIcon, RedoIcon, SparklesIcon, UndoIcon, SaveIcon, XIcon, PlusIcon, InfoIcon } from '../components/icons';
import { usePresets } from '../hooks/usePresets';


interface RenderMainScreenProps {
    onNavigate: (screen: Screen) => void;
    planFile: ImageFile | null;
    styleFiles: ImageFile[];
    setStyleFiles: React.Dispatch<React.SetStateAction<ImageFile[]>>;
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    handleRender: () => void;
    isLoading: boolean;
    statusMessage: string;
    progress: number;
    currentRender: string | null;
    renderResult: string | null;
    editPrompt: string;
    setEditPrompt: React.Dispatch<React.SetStateAction<string>>;
    handleEnhance: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleDownload: () => void;
    canUndo: boolean;
    canRedo: boolean;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    // Batch Props
    batchQueue: BatchJob[];
    isBatchRendering: boolean;
    currentBatchIndex: number;
    addToBatch: () => void;
    removeFromBatch: (jobId: string) => void;
    clearBatch: () => void;
    startBatchRender: () => void;
}

const BatchJobItem: React.FC<{ job: BatchJob, onRemove: (id: string) => void, disabled: boolean }> = ({ job, onRemove, disabled }) => {
    const statusColors: Record<BatchJob['status'], string> = {
        queued: 'bg-gray-400 dark:bg-gray-500',
        rendering: 'bg-blue-500',
        completed: 'bg-green-500',
        failed: 'bg-red-500',
    };
    const statusPillColors: Record<BatchJob['status'], string> = {
        queued: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        rendering: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
            <div className={`w-2 h-10 rounded-full flex-shrink-0 ${statusColors[job.status]}`}></div>
            <div className="flex -space-x-2 flex-shrink-0">
                {job.styleFiles.slice(0, 2).map((sf, idx) => 
                    <img key={idx} src={sf.previewUrl} title={sf.file.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                )}
                {job.styleFiles.length > 2 && 
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">+{job.styleFiles.length - 2}</div>
                }
                 {job.styleFiles.length === 0 && 
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">0</div>
                }
            </div>
            <div className="flex-grow text-xs truncate">
                <p className="font-semibold truncate">{job.settings.resolution}, {job.settings.lightingPreset}</p>
                <p className="text-gray-500 dark:text-gray-400">{job.styleFiles.length} style(s)</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {job.status === 'completed' && job.result ? (
                     <a href={job.result} download={`render-${job.id.slice(0, 6)}.png`}>
                        <IconButton aria-label="Download batch result" className="!p-1.5 !bg-green-500/20 hover:!bg-green-500/40">
                            <DownloadIcon className="w-4 h-4 text-green-700 dark:text-green-300" />
                        </IconButton>
                    </a>
                ) : (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full capitalize ${statusPillColors[job.status]}`}>{job.status}</span>
                )}
            </div>
             <IconButton onClick={() => onRemove(job.id)} disabled={disabled} aria-label="Remove job from batch" className="!p-1.5 flex-shrink-0">
                <XIcon className="w-4 h-4" />
            </IconButton>
        </motion.div>
    );
}

export const RenderMainScreen: React.FC<RenderMainScreenProps> = (props) => {
    const { presets, savePreset, deletePreset } = usePresets();
    const [selectedPresetName, setSelectedPresetName] = React.useState<string>('');

    React.useEffect(() => {
        if (presets.length > 0 && !presets.some(p => p.name === selectedPresetName)) {
            setSelectedPresetName(presets[0].name);
        } else if (presets.length === 0) {
            setSelectedPresetName('');
        }
    }, [presets, selectedPresetName]);

    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "My Preset");
        if (name) {
            savePreset(name, props.settings, props.styleFiles);
            setSelectedPresetName(name);
        }
    };

    const handleLoadPreset = () => {
        const presetToLoad = presets.find(p => p.name === selectedPresetName);
        if (!presetToLoad) return;

        if (props.styleFiles.length > 0 && presetToLoad.styles.length > 0) {
            if (!window.confirm(`Loading "${presetToLoad.name}" will replace your current style references. Continue?`)) {
                return;
            }
        }
        
        props.setSettings(presetToLoad.settings);

        const newStyleFiles: ImageFile[] = presetToLoad.styles.map((style, index) => {
            const dummyFile = new File([], `preset-style-${index}.${style.mimeType.split('/')[1] || 'png'}`, { type: style.mimeType });
            return {
                file: dummyFile,
                previewUrl: `data:${style.mimeType};base64,${style.base64}`,
                base64: style.base64,
                weight: style.weight,
            };
        });

        // Revoke old object URLs before setting new files to prevent memory leaks
        props.styleFiles.forEach(file => {
            if (file.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(file.previewUrl);
            }
        });

        props.setStyleFiles(newStyleFiles);
        alert(`Preset "${presetToLoad.name}" loaded successfully.`);
    };

    const handleDeletePreset = () => {
        if (selectedPresetName && confirm(`Are you sure you want to delete the preset "${selectedPresetName}"?`)) {
            deletePreset(selectedPresetName);
        }
    };
    
    const handleStyleWeightChange = (indexToUpdate: number, newWeight: number) => {
        props.setStyleFiles(currentFiles =>
            currentFiles.map((file, index) =>
                index === indexToUpdate ? { ...file, weight: newWeight } : file
            )
        );
    };

    const handleRemoveStyleFile = (indexToRemove: number) => {
        props.setStyleFiles(currentFiles => {
            const fileToRemove = currentFiles[indexToRemove];
            // Only revoke object URLs created in the browser, not data URIs from presets
            if (fileToRemove.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fileToRemove.previewUrl);
            }
            return currentFiles.filter((_, index) => index !== indexToRemove)
        });
    };

    return (
        <motion.div
            key="renderMain"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full"
        >
            {/* Middle: Result */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col h-[75vh]">
                <div className="flex-grow bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <AnimatePresence>
                    {props.isLoading && (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
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

                    {props.error && (
                        <motion.div 
                            initial={{opacity: 0, y: -20}} 
                            animate={{opacity: 1, y: 0}} 
                            exit={{opacity: 0, y: -20, transition: {duration: 0.2}}}
                            className="absolute top-4 left-4 right-4 bg-red-100 dark:bg-red-900/80 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg z-20 flex items-center justify-between"
                        >
                            <div className="flex items-start">
                                <InfoIcon className="w-5 h-5 mr-3 mt-0.5 text-red-500 flex-shrink-0"/>
                                <div>
                                    <p className="font-bold">Generation Error</p>
                                    <p className="text-sm">{props.error}</p>
                                </div>
                            </div>
                            <IconButton onClick={() => props.setError(null)} aria-label="Dismiss error" className="!bg-red-200/50 dark:!bg-red-800/50 hover:!bg-red-200 dark:hover:!bg-red-700 !text-red-700 dark:!text-red-200 ml-4">
                                <XIcon className="w-5 h-5"/>
                            </IconButton>
                        </motion.div>
                    )}

                    {props.currentRender ? (
                        <motion.img 
                            key={props.currentRender}
                            src={props.currentRender} 
                            alt="3D Render" 
                            className="max-w-full max-h-full object-contain"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                    ) : (
                        <div className="text-center text-gray-500">
                            <BuildingIcon className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                            <h3 className="text-lg font-semibold">Your 3D Render Will Appear Here</h3>
                            <p className="text-sm">Configure your settings and click 'Generate' to begin.</p>
                        </div>
                    )}
                    </AnimatePresence>

                     {props.currentRender && (
                        <motion.div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl p-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                        >
                            <div className="flex items-center gap-2 p-2 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-[14px]">
                                <input
                                    type="text"
                                    value={props.editPrompt}
                                    onChange={(e) => props.setEditPrompt(e.target.value)}
                                    placeholder="e.g., make the walls light blue"
                                    className="flex-grow bg-gray-200/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                                    disabled={props.isLoading}
                                />
                                <div className="flex items-center gap-1">
                                    <IconButton onClick={props.handleUndo} disabled={props.isLoading || !props.canUndo} aria-label="Undo">
                                        <UndoIcon className="w-5 h-5" />
                                    </IconButton>
                                    <IconButton onClick={props.handleRedo} disabled={props.isLoading || !props.canRedo} aria-label="Redo">
                                        <RedoIcon className="w-5 h-5" />
                                    </IconButton>
                                </div>
                                <ActionButton onClick={props.handleEnhance} disabled={props.isLoading || !props.editPrompt} icon={<SparklesIcon className="w-5 h-5" />} label="Enhance" />
                                <IconButton onClick={props.handleDownload} disabled={props.isLoading} aria-label="Download">
                                    <DownloadIcon className="w-5 h-5" />
                                </IconButton>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Right: Settings Panel */}
            <aside className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-2 pb-4 border-b border-gray-200 dark:border-gray-700/60">Render Settings</h2>
                <div className="flex-grow overflow-y-auto -mx-4 px-4">
                    <fieldset disabled={props.isBatchRendering}>
                        <Accordion title="Style References" defaultOpen={true}>
                             <Reorder.Group
                                as="div"
                                axis="y"
                                values={props.styleFiles}
                                onReorder={props.setStyleFiles}
                                className="space-y-3 max-h-48 overflow-y-auto pr-2"
                            >
                                {props.styleFiles.map((file, index) => (
                                     <Reorder.Item
                                        key={file.previewUrl}
                                        value={file}
                                        layout
                                        whileDrag={{ scale: 1.02, cursor: 'grabbing', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                                        className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg cursor-grab"
                                    >
                                        <img src={file.previewUrl} alt={`Style ref ${index}`} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                        <div className="flex-grow">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Influence</p>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={file.weight ?? 1.0}
                                                onChange={(e) => handleStyleWeightChange(index, parseFloat(e.target.value))}
                                                className="w-full h-1 rounded-lg appearance-none cursor-pointer range-sm"
                                                aria-label="Style influence"
                                            />
                                        </div>
                                        <span className="font-mono bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-md text-sm text-gray-800 dark:text-gray-200 w-12 text-center">
                                            {(file.weight ?? 1.0).toFixed(1)}
                                        </span>
                                        <IconButton onClick={() => handleRemoveStyleFile(index)} aria-label="Remove style reference" className="!p-1.5 flex-shrink-0">
                                            <XIcon className="w-4 h-4" />
                                        </IconButton>
                                    </Reorder.Item>
                                ))}
                                {props.styleFiles.length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No style references uploaded.</p>
                                )}
                            </Reorder.Group>
                        </Accordion>
                        <Accordion title="Quality & Output">
                            <div className="space-y-6">
                                <SettingItemWithTooltip
                                    label="Resolution"
                                    tooltipText="Sets the output image dimensions. Higher resolutions produce sharper images but may take longer to render."
                                >
                                    <div className="flex flex-wrap gap-2">
                                        <SettingButton label="1080p" value="1080p" setting={props.settings.resolution} onSelect={(v) => props.setSettings(s => ({...s, resolution: v as any}))} />
                                        <SettingButton label="2K" value="2k" setting={props.settings.resolution} onSelect={(v) => props.setSettings(s => ({...s, resolution: v as any}))} />
                                        <SettingButton label="4K" value="4k" setting={props.settings.resolution} onSelect={(v) => props.setSettings(s => ({...s, resolution: v as any}))} />
                                    </div>
                                </SettingItemWithTooltip>
                                <SettingItemWithTooltip
                                    label="Aspect Ratio"
                                    tooltipText="Sets the output image's width-to-height ratio."
                                >
                                    <div className="flex flex-wrap gap-2">
                                        <SettingButton label="16:9" value="16:9" setting={props.settings.aspectRatio} onSelect={(v) => props.setSettings(s => ({...s, aspectRatio: v as any}))} />
                                        <SettingButton label="9:16" value="9:16" setting={props.settings.aspectRatio} onSelect={(v) => props.setSettings(s => ({...s, aspectRatio: v as any}))} />
                                        <SettingButton label="1:1" value="1:1" setting={props.settings.aspectRatio} onSelect={(v) => props.setSettings(s => ({...s, aspectRatio: v as any}))} />
                                        <SettingButton label="4:3" value="4:3" setting={props.settings.aspectRatio} onSelect={(v) => props.setSettings(s => ({...s, aspectRatio: v as any}))} />
                                        <SettingButton label="3:4" value="3:4" setting={props.settings.aspectRatio} onSelect={(v) => props.setSettings(s => ({...s, aspectRatio: v as any}))} />
                                    </div>
                                </SettingItemWithTooltip>
                                 <SettingItemWithTooltip
                                    label="Denoising Strength"
                                    tooltipText="Controls noise reduction. Higher values create smoother images but can reduce fine details."
                                >
                                    <div className="flex items-center space-x-3">
                                        <Slider 
                                            value={props.settings.denoising}
                                            onChange={(e) => props.setSettings(s => ({...s, denoising: parseFloat(e.target.value)}))}
                                            min={0} max={1} step={0.05}
                                        />
                                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-900 w-14 text-center py-1 rounded">{props.settings.denoising.toFixed(2)}</span>
                                    </div>
                                </SettingItemWithTooltip>
                            </div>
                        </Accordion>
                        <Accordion title="Lighting & Mood">
                             <SettingItemWithTooltip
                                label="Lighting Style"
                                tooltipText="Determines the overall lighting style and mood of the scene."
                            >
                                    <Select value={props.settings.lightingPreset} onChange={(e) => props.setSettings(s => ({...s, lightingPreset: e.target.value as any}))}>
                                    <option value="studio">Studio</option>
                                    <option value="sunny">Sunny</option>
                                    <option value="night">Night</option>
                                    <option value="dramatic">Dramatic</option>
                                    <option value="golden hour">Golden Hour</option>
                                    <option value="overcast">Overcast</option>
                                </Select>
                            </SettingItemWithTooltip>
                        </Accordion>
                        <Accordion title="Presets">
                            <div className="space-y-4">
                                <ActionButton 
                                    onClick={handleSavePreset} 
                                    icon={<SaveIcon className="w-5 h-5" />} 
                                    label="Save Current as Preset"
                                    className="w-full bg-sky-500 hover:bg-sky-600"
                                />
                                {presets.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Manage Presets</label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-grow">
                                                <Select 
                                                    value={selectedPresetName} 
                                                    onChange={(e) => setSelectedPresetName(e.target.value)}
                                                    aria-label="Select a preset"
                                                >
                                                    {presets.map(preset => (
                                                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <IconButton 
                                                onClick={handleDeletePreset} 
                                                disabled={!selectedPresetName}
                                                aria-label="Delete selected preset"
                                                className="!bg-red-500/90 !text-white hover:!bg-red-600"
                                            >
                                                <XIcon className="w-5 h-5" />
                                            </IconButton>
                                        </div>
                                        <ActionButton 
                                            onClick={handleLoadPreset} 
                                            label={`Load "${selectedPresetName}"`}
                                            disabled={!selectedPresetName}
                                            className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </Accordion>
                    </fieldset>
                    <Accordion title={`Batch Rendering (${props.batchQueue.length})`}>
                        <div className="space-y-3">
                            <ActionButton 
                                onClick={props.addToBatch}
                                disabled={props.isBatchRendering}
                                icon={<PlusIcon className="w-5 h-5" />}
                                label="Add Current to Batch"
                                className="w-full bg-indigo-500 hover:bg-indigo-600"
                            />

                            {props.isBatchRendering && props.batchQueue.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2 pt-2"
                                >
                                    <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <span>Overall Batch Progress</span>
                                        <span>Job {Math.min(props.currentBatchIndex + 1, props.batchQueue.length)} of {props.batchQueue.length}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <motion.div
                                            className="bg-indigo-500 h-2.5 rounded-full"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${props.batchQueue.length > 0 ? (props.currentBatchIndex / props.batchQueue.length) * 100 : 0}%` }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                <AnimatePresence>
                                    {props.batchQueue.map(job => (
                                        <BatchJobItem key={job.id} job={job} onRemove={props.removeFromBatch} disabled={props.isBatchRendering} />
                                    ))}
                                </AnimatePresence>
                            </div>
                             {props.batchQueue.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <ActionButton 
                                        onClick={props.startBatchRender}
                                        disabled={props.isBatchRendering}
                                        label="Start Batch Render"
                                        className="w-full"
                                    />
                                    <ActionButton 
                                        onClick={props.clearBatch}
                                        disabled={props.isBatchRendering}
                                        label="Clear"
                                        className="bg-red-500 hover:bg-red-600"
                                    />
                                </div>
                            )}
                        </div>
                    </Accordion>
                </div>

                <div className="flex-shrink-0 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/60 space-y-3">
                    <ActionButton 
                        onClick={props.handleRender} 
                        disabled={props.isLoading || !props.planFile || props.isBatchRendering}
                        icon={<SparklesIcon className="w-5 h-5" />} 
                        label={props.isBatchRendering ? "Batch in Progress..." : "Generate 3D Render"} 
                        className="w-full"
                    />
                    <ActionButton 
                        onClick={() => props.onNavigate('renderUpload')} 
                        label="Back to Uploads" 
                        className="w-full bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600"
                    />
                </div>
            </aside>
        </motion.div>
    );
};