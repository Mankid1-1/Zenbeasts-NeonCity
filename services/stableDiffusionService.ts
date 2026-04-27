
import { BeastClass, Trait } from '../types';
import { compositeBeastImage } from './hashlipsCompositor';

// --- API KEY MANAGEMENT ---
const getStabilityApiKey = (): string => {
  if (typeof window !== 'undefined') {
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

  // No API key: composite locally from the Hashlips layer assets in /public/layers/.
  if (!apiKey || apiKey === 'undefined' || apiKey === 'YOUR_STABILITY_API_KEY') {
    console.warn("No Stability AI API Key found. Compositing locally from Hashlips layers.");
    return compositeBeastImage(beastClass, traits);
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
      let errorMessage = `Status: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        // Stability AI standard error format often includes { name, message }
        if (errorBody.message) {
          errorMessage += ` - ${errorBody.message}`;
        } else if (errorBody.name) {
          errorMessage += ` - ${errorBody.name}`;
        }
      } catch {
        // Ignore JSON parse errors, keep only status
      }
      throw new Error(errorMessage);
    }

    const responseJSON = await response.json();
    // Stability AI returns base64 images
    const base64Image = responseJSON.artifacts[0].base64;
    return `data:image/png;base64,${base64Image}`;

  } catch (error) {
    // SECURITY: Log only the error message to avoid leaking sensitive data (like headers in raw error objects)
    console.error("Stable Diffusion Generation Error:", error instanceof Error ? error.message : "Unknown error");
    // Degrade to local Hashlips composite so the beast still renders.
    return compositeBeastImage(beastClass, traits);
  }
};
