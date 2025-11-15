import { useState, useEffect } from 'react';
import { Settings, ImageFile, Preset, StyleReference } from '../types';

const PRESETS_STORAGE_KEY = 'hikari-render-presets';

export const usePresets = () => {
    const [presets, setPresets] = useState<Preset[]>(() => {
        try {
            const storedPresets = window.localStorage.getItem(PRESETS_STORAGE_KEY);
            return storedPresets ? JSON.parse(storedPresets) : [];
        } catch (error) {
            console.error("Error reading presets from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
        } catch (error) {
            console.error("Error saving presets to localStorage", error);
        }
    }, [presets]);

    const savePreset = (name: string, settings: Settings, styleFiles: ImageFile[]) => {
        if (presets.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            if (!confirm(`A preset named "${name}" already exists. Do you want to overwrite it?`)) {
                return;
            }
        }

        const styleReferences: StyleReference[] = styleFiles.map(file => ({
            base64: file.base64,
            mimeType: file.file.type,
            weight: file.weight ?? 1.0,
        }));

        const newPreset: Preset = {
            name,
            settings,
            styles: styleReferences,
        };

        setPresets(currentPresets => {
            const existingIndex = currentPresets.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
            if (existingIndex !== -1) {
                const updatedPresets = [...currentPresets];
                updatedPresets[existingIndex] = newPreset;
                return updatedPresets;
            } else {
                return [...currentPresets, newPreset];
            }
        });
    };

    const deletePreset = (name: string) => {
        setPresets(currentPresets => currentPresets.filter(p => p.name !== name));
    };

    return { presets, savePreset, deletePreset };
};
