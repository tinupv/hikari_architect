import { GoogleGenAI, Modality } from "@google/genai";
import { Settings } from "../types";

// Fix: Create a new GoogleGenAI client with the latest API key for each call.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });


const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const generate3dRender = async (plan: {base64: string; mimeType: string;}, styles: {base64: string; mimeType: string; weight: number;}[], settings: Settings) => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash-image';
  
  const planPart = fileToGenerativePart(plan.base64, plan.mimeType);
  const styleParts = styles.map(style => fileToGenerativePart(style.base64, style.mimeType));

  let stylePrompt: string;
    if (styles.length === 0) {
        stylePrompt = 'Generate a modern, minimalist style.';
    } else if (styles.length === 1 && styles[0].weight) {
        stylePrompt = `The second image is a style reference. Its influence weight is ${styles[0].weight.toFixed(1)} out of 1.0. Use it to determine the materials, color palette, lighting, furniture style, and overall mood for the 3D render. A weight of 1.0 means full influence, 0.0 means no influence.`;
    } else {
        const styleDescriptions = styles.map((style, index) =>
            `Style Image #${index + 1} has an influence weight of ${(style.weight ?? 1.0).toFixed(1)}/1.0`
        ).join('; ');

        stylePrompt = `The ${styles.length} images provided after the plan are style references, each with a specific influence weight. You MUST blend their artistic styles, materials, color palettes, lighting, furniture, and overall mood to create a cohesive 3D render. Adhere to the weights: a higher weight means that style should be more dominant. The references are: ${styleDescriptions}.`;
    }
    
  const textPart = { text: `You are an expert architectural visualization AI. Your task is to convert a 2D architectural floor plan into an ultra-realistic 3D render.
      
      RULES:
      1. PRESERVE GEOMETRY: The first image is the 2D floor plan. You MUST NOT alter the structure, layout, walls, doors, or windows shown in this plan. The final 3D render must be an exact structural match to the 2D plan.
      2. APPLY STYLE: ${stylePrompt}
      3. SETTINGS: The lighting should be '${settings.lightingPreset}'. The final image resolution should be high-quality, suitable for a '${settings.resolution}' display. The image aspect ratio MUST be ${settings.aspectRatio}.
      4. OUTPUT: Produce a single, high-quality, photorealistic 3D rendering from an isometric or eye-level perspective.`};

  const parts: any[] = [
      planPart,
      ...styleParts,
      textPart
  ];

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
        throw new Error(`Render was blocked due to: ${blockReason}. Please adjust your style images or prompts.`);
    }
    throw new Error("The model did not return any content. The request may have been blocked or the input was invalid.");
  }

  const imagePart = response.candidates[0]?.content?.parts?.find(part => part.inlineData);

  if (imagePart && imagePart.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  
  // Fix: Renamed 'textPart' to 'responseTextPart' to avoid redeclaration.
  const responseTextPart = response.candidates[0]?.content?.parts?.find(part => part.text);
  if (responseTextPart && responseTextPart.text) {
      console.error("Model returned text instead of an image for 3D render:", responseTextPart.text);
      throw new Error(`Render failed. The AI responded with text: "${responseTextPart.text.substring(0, 150)}..."`);
  }

  throw new Error("Could not generate 3D render. The model returned content but it was not a valid image.");
};


export const editImage = async (image: {base64: string; mimeType: string;}, prompt: string) => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-image';
    
    const imagePart = fileToGenerativePart(image.base64, image.mimeType);
    
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [imagePart, { text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    if (!response.candidates || response.candidates.length === 0) {
        const blockReason = response.promptFeedback?.blockReason;
        if (blockReason) {
            throw new Error(`Enhancement was blocked due to: ${blockReason}. Please adjust your prompt.`);
        }
        throw new Error("The model did not return any content for enhancement. The request may have been blocked or the input was invalid.");
    }

    // Fix: Renamed 'imagePart' to 'responseImagePart' to avoid redeclaration.
    const responseImagePart = response.candidates[0]?.content?.parts?.find(part => part.inlineData);

    if (responseImagePart && responseImagePart.inlineData) {
        return `data:${responseImagePart.inlineData.mimeType};base64,${responseImagePart.inlineData.data}`;
    }

    const textPart = response.candidates[0]?.content?.parts?.find(part => part.text);
    if (textPart && textPart.text) {
        console.error("Model returned text instead of an image for image edit:", textPart.text);
        throw new Error(`Edit failed. The AI responded with text: "${textPart.text.substring(0, 150)}..."`);
    }

    throw new Error("Could not edit image. The model returned content but it was not a valid image.");
};

export const generateImages = async (prompt: string, numberOfImages: number, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4') => {
    const ai = getAiClient();
    const model = 'imagen-4.0-generate-001';

    const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
            numberOfImages,
            outputMimeType: 'image/png',
            aspectRatio,
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        const blockReason = response.promptFeedback?.blockReason;
        if (blockReason) {
             throw new Error(`Image generation was blocked due to: ${blockReason}. Please adjust your prompt.`);
        }
        throw new Error("The model did not return any images. The request may have been blocked or the prompt was invalid.");
    }
    
    return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
};

export const generateVideo = async (image: {base64: string; mimeType: string;}, prompt: string, aspectRatio: '16:9' | '9:16', onProgress: (message: string) => void) => {
    const ai = getAiClient();
    const model = 'veo-3.1-fast-generate-preview';
    onProgress("Starting video generation...");
    
    let operation = await ai.models.generateVideos({
        model,
        prompt,
        image: {
            imageBytes: image.base64,
            mimeType: image.mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        },
    });
    
    onProgress("Video job initiated. This may take a few minutes...");
    
    const pollInterval = 10000; // 10 seconds
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes timeout

    while (!operation.done && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        onProgress(`Checking status (${attempts + 1}/${maxAttempts})...`);
        operation = await ai.operations.getVideosOperation({ operation });
        attempts++;
    }

    if (!operation.done) {
        throw new Error("Video generation timed out.");
    }

    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    onProgress("Fetching generated video...");
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    // Fix: Use process.env.API_KEY directly to ensure the freshest key is used.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error("Failed to download the generated video.");
    }
    
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};