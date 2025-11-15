import React, { useId, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { UploadIcon, ChevronDownIcon, InfoIcon, XIcon, PlusIcon } from './icons';
import { ImageFile } from '../types';

export const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200 dark:border-gray-700/60 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-4 px-4"
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 pt-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const TooltipWrapper: React.FC<{ tooltipText: string, children: React.ReactNode, className?: string }> = ({ tooltipText, children, className }) => {
    // Using `inline-block` by default so it can be used inline or as a block with width utilities.
    return (
        <div className={`relative group inline-block ${className}`}>
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-gray-900 text-gray-100 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30 dark:bg-gray-100 dark:text-gray-800">
              {tooltipText}
            </div>
        </div>
    );
};

export const FileUploadCard: React.FC<{ title: string, description: string, file: ImageFile | null, onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ title, description, file, onFileChange }) => {
    const inputId = useId();
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-300">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">{description}</p>
            <label htmlFor={inputId} className="cursor-pointer flex-grow">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-500 transition-colors duration-200 rounded-lg p-6 text-center h-full flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                    {file ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <img src={file.previewUrl} alt="Preview" className="max-h-32 mx-auto rounded-md mb-2"/>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-400 truncate">{file.file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-gray-500 dark:text-gray-500"
                        >
                            <UploadIcon className="w-8 h-8 mx-auto mb-2 opacity-60"/>
                            <span className="text-sm font-semibold text-teal-500">Click to upload</span>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </label>
            <input id={inputId} type="file" className="hidden" accept="image/png, image/jpeg" onChange={onFileChange}/>
        </div>
    );
};

export const MultiFileUploadCard: React.FC<{
    title: string;
    description: string;
    files: ImageFile[];
    onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileRemove: (index: number) => void;
    onStyleWeightChange: (index: number, weight: number) => void;
    onFilesReorder: (files: ImageFile[]) => void;
}> = ({ title, description, files, onFilesChange, onFileRemove, onStyleWeightChange, onFilesReorder }) => {
    const fileInputId = useId();
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-300">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            <div className="flex-grow grid grid-cols-3 sm:grid-cols-4 gap-3 content-start">
                <Reorder.Group
                    as="div"
                    values={files}
                    onReorder={onFilesReorder}
                    className="contents" 
                >
                    <AnimatePresence>
                    {files.map((file, index) => (
                        <Reorder.Item
                            key={file.previewUrl}
                            value={file}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                            className="relative group bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden flex flex-col shadow cursor-grab"
                        >
                            <div className="relative aspect-square">
                                <img src={file.previewUrl} alt={`Style reference ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <button
                                        onClick={() => onFileRemove(index)}
                                        className="p-1.5 bg-red-600/80 text-white rounded-full hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-red-400"
                                        aria-label="Remove image"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-2 text-xs">
                                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 mb-1">
                                    <span className="font-medium">Influence</span>
                                    <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{(file.weight ?? 1.0).toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={file.weight ?? 1.0}
                                    onChange={(e) => onStyleWeightChange(index, parseFloat(e.target.value))}
                                    className="w-full h-1 rounded-lg appearance-none cursor-pointer range-sm"
                                    aria-label="Style influence"
                                />
                            </div>
                        </Reorder.Item>
                    ))}
                    </AnimatePresence>
                </Reorder.Group>
                <label htmlFor={fileInputId} className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-500 transition-colors duration-200 rounded-lg p-2 text-center flex flex-col items-center justify-center text-gray-500 hover:text-teal-400">
                    <PlusIcon className="w-6 h-6 mb-1"/>
                    <span className="text-xs font-semibold">Add Style</span>
                </label>
            </div>
            <input id={fileInputId} type="file" multiple className="hidden" accept="image/png, image/jpeg" onChange={onFilesChange}/>
        </div>
    );
};

export const SettingButton: React.FC<{label: string, value: string, setting: string, onSelect: (value: string) => void}> = ({ label, value, setting, onSelect }) => {
    const isActive = setting === value;
    return (
        <button 
            onClick={() => onSelect(value)}
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-teal-400 ${
                isActive ? 'bg-teal-500 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
            {label}
        </button>
    )
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({children, ...props}) => (
    <div className="relative">
         <select 
            {...props}
            className="w-full appearance-none bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 focus:border-teal-400 focus:ring-2 focus:ring-teal-300/50"
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
            <ChevronDownIcon className="w-5 h-5"/>
        </div>
    </div>
);

export const SettingItemWithTooltip: React.FC<{ label: string, tooltipText: string, children: React.ReactNode }> = ({ label, tooltipText, children }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
          <div className="relative group flex items-center">
            <InfoIcon className="w-4 h-4 text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 border border-gray-200 dark:border-gray-700">
              {tooltipText}
            </div>
          </div>
        </div>
        {children}
      </div>
    );
};

export const Slider: React.FC<{value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, min: number, max: number, step: number}> = ({value, onChange, min, max, step}) => (
    <div className="flex-grow">
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full" />
    </div>
);

export const ActionButton: React.FC<{ onClick: () => void, disabled?: boolean, icon?: React.ReactNode, label: string, className?: string}> = ({ onClick, disabled, icon, label, className }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-teal-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600 active:scale-[0.98] active:shadow-inner ${className}`}
    >
        {icon && <span className="mr-2 -ml-1">{icon}</span>}
        {label}
    </button>
);

export const IconButton: React.FC<{ onClick?: () => void, disabled?: boolean, children: React.ReactNode, "aria-label": string, className?: string}> = ({ onClick, disabled, children, "aria-label": ariaLabel, className }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-teal-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-400/50 dark:active:bg-gray-700/50 ${className}`}
    >
        {children}
    </button>
);

export const RatioButton: React.FC<{label: string, value: string, selected: string, setSelected: (value: any) => void}> = ({ label, value, selected, setSelected }) => {
     const isActive = selected === value;
     return (
        <button 
            onClick={() => setSelected(value)}
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-teal-400 ${
                isActive ? 'bg-teal-500 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
            {label}
        </button>
     )
};

export const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);