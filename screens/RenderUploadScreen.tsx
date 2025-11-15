
import React from 'react';
import { motion } from 'framer-motion';
import { ImageFile, Screen } from '../types';
import { FileUploadCard, MultiFileUploadCard, ActionButton } from '../components/ui';

interface RenderUploadScreenProps {
    onNavigate: (screen: Screen) => void;
    planFile: ImageFile | null;
    styleFiles: ImageFile[];
    onPlanFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStyleFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStyleFileRemove: (index: number) => void;
    onStyleWeightChange: (index: number, weight: number) => void;
    onStyleFilesReorder: (files: ImageFile[]) => void;
}

export const RenderUploadScreen: React.FC<RenderUploadScreenProps> = ({
    onNavigate,
    planFile,
    styleFiles,
    onPlanFileChange,
    onStyleFilesChange,
    onStyleFileRemove,
    onStyleWeightChange,
    onStyleFilesReorder,
}) => {
    return (
        <motion.div
            key="renderUpload"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">Upload Your Assets</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Start by providing a floor plan and optional style references.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                <FileUploadCard 
                    title="1. Upload 2D Plan" 
                    description="Upload a floor plan, sketch, or blueprint (JPG, PNG)."
                    file={planFile}
                    onFileChange={onPlanFileChange}
                />
                <MultiFileUploadCard
                    title="2. Upload Style References (Optional)"
                    description="Drag to reorder. Upload images for style, materials, and lighting. Adjust 'Influence' for each."
                    files={styleFiles}
                    onFilesChange={onStyleFilesChange}
                    onFileRemove={onStyleFileRemove}
                    onStyleWeightChange={onStyleWeightChange}
                    onFilesReorder={onStyleFilesReorder}
                />
            </div>
            
            <div className="mt-8 flex justify-between items-center">
                 <ActionButton 
                    onClick={() => onNavigate('welcome')} 
                    label="Back" 
                    className="bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600"
                />
                 <ActionButton 
                    onClick={() => onNavigate('renderMain')} 
                    label="Next: Configure Render" 
                    disabled={!planFile}
                />
            </div>
        </motion.div>
    );
};