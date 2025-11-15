
export interface Settings {
  resolution: '1080p' | '2k' | '4k';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  lightingPreset: 'studio' | 'sunny' | 'night' | 'dramatic' | 'golden hour' | 'overcast';
  lockStructure: boolean;
  denoising: number;
}

export type Screen = 'welcome' | 'renderUpload' | 'renderMain' | 'animate' | 'imageGeneration';

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  weight?: number;
}

export interface StyleReference {
  base64: string;
  mimeType: string;
  weight: number;
}

export interface Preset {
  name: string;
  settings: Settings;
  styles: StyleReference[];
}

export interface BatchJob {
  id: string;
  settings: Settings;
  styleFiles: ImageFile[];
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  result?: string;
}