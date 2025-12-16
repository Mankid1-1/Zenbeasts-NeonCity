
import { BeastClass, Trait } from '../types';

// --- API KEY MANAGEMENT ---
const getStabilityApiKey = (): string => {
  if (typeof window !== 'undefined') {
    // SECURITY: Use import.meta.env for Vite instead of process.env which might expose secrets if defined in vite config
    return localStorage.getItem('STABILITY_API_KEY') || import.meta.env.VITE_STABILITY_API_KEY || '';
  }
  return import.meta.env.VITE_STABILITY_API_KEY || '';
};

// Placeholder for the Stability AI endpoint
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

export const generateStableDiffusionImage = async (
  beastClass: BeastClass,
  traits: Trait[]
): Promise<string> => {
  const apiKey = getStabilityApiKey();
  
  // Construct a detailed prompt based on the 12-trait Hashlips selection
  const traitDescription = traits.map(t => `${t.type}: ${t.value}`).join(', ');
  
  const prompt = `
    A high-quality 3D voxel art render of a ${beastClass} martial arts character.
    Cyberpunk aesthetic, neon lighting, dark background.
    Specific details: ${traitDescription}.
    Detailed textures, ray tracing, volumetric lighting, 8k resolution.
    Style: Magicavoxel, Cryptovoxels, SandboxGame.
  `;

  // If no API key is present in this demo environment, return a deterministic placeholder
  // SECURITY: Check for default placeholder to avoid sending it to the API
  if (!apiKey || apiKey === 'undefined' || apiKey === 'YOUR_STABILITY_API_KEY') {
    console.warn("No Stability AI API Key found. Using deterministic simulation.");

    // Create a deterministic seed from the beast's visual traits
    const seed = beastClass + traits.map(t => t.value).join('');
    return `https://picsum.photos/seed/${seed}/400/400`;
  }

  try {
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
          {
             text: "blurry, low quality, distortion, 2d, sketch, drawing",
             weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    });

    if (!response.ok) {
      // SECURITY: Do not leak the raw response text in the error message as it may contain sensitive info
      const errorText = await response.text();
      console.error('Stability AI API Error:', errorText);
      throw new Error('Failed to generate image from Stability AI');
    }

    const responseJSON = await response.json();
    // Stability AI returns base64 images
    const base64Image = responseJSON.artifacts[0].base64;
    return `data:image/png;base64,${base64Image}`;

  } catch (error) {
    console.error("Stable Diffusion Generation Error:", error);
    // Fallback to placeholder on error
    return `https://picsum.photos/seed/${Math.random()}/400/400`;
  }
};
