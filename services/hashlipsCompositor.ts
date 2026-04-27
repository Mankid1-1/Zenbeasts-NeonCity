import { BeastClass, Trait } from '../types';
import hashlipsConfig from '../hashlips_config.json';

const CANVAS_SIZE = 512;
const LAYERS_BASE = '/layers';

// Variants that explicitly mean "no asset for this layer" — skipped during compositing.
const SKIP_VARIANTS = new Set(['None', 'Dormant', 'Clean']);

const imageCache = new Map<string, HTMLImageElement | null>();

const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const loadImage = (url: string): Promise<HTMLImageElement | null> => {
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url) ?? null);
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      imageCache.set(url, null);
      resolve(null);
    };
    img.src = url;
  });
};

const orderTraitsByLayer = (traits: Trait[]): Trait[] => {
  const order = hashlipsConfig.layerConfigurations[0].layersOrder.map(l => l.name);
  const byType = new Map(traits.map(t => [t.type as string, t]));
  return order
    .map(name => byType.get(name))
    .filter((t): t is Trait => Boolean(t));
};

const renderTextFallback = (
  ctx: CanvasRenderingContext2D,
  beastClass: BeastClass,
  traits: Trait[]
): void => {
  const seedHue =
    Array.from(beastClass).reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
  const grad = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  grad.addColorStop(0, `hsl(${seedHue}, 70%, 14%)`);
  grad.addColorStop(1, `hsl(${(seedHue + 60) % 360}, 90%, 32%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(beastClass.toUpperCase(), CANVAS_SIZE / 2, 60);

  ctx.textAlign = 'left';
  ctx.font = '15px monospace';
  traits.slice(0, 12).forEach((t, i) => {
    ctx.fillText(`${t.type}: ${t.value}`, 24, 110 + i * 26);
  });

  ctx.textAlign = 'center';
  ctx.font = '11px monospace';
  ctx.globalAlpha = 0.55;
  ctx.fillText(
    'layer art missing — drop PNGs into public/layers/',
    CANVAS_SIZE / 2,
    CANVAS_SIZE - 18
  );
  ctx.globalAlpha = 1;
};

export const compositeBeastImage = async (
  beastClass: BeastClass,
  traits: Trait[]
): Promise<string> => {
  // Non-DOM env (SSR, vitest without jsdom canvas) — return seeded placeholder.
  if (typeof document === 'undefined') {
    const seed = beastClass + traits.map(t => t.value).join('');
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`;
  }

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const seed = beastClass + traits.map(t => t.value).join('');
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`;
  }

  const ordered = orderTraitsByLayer(traits);
  const images = await Promise.all(
    ordered.map(t => {
      if (SKIP_VARIANTS.has(t.value)) return Promise.resolve(null);
      const url = `${LAYERS_BASE}/${t.type}/${slugify(t.value)}.png`;
      return loadImage(url);
    })
  );

  let drewSomething = false;
  images.forEach(img => {
    if (img) {
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drewSomething = true;
    }
  });

  if (!drewSomething) {
    renderTextFallback(ctx, beastClass, ordered);
  }

  return canvas.toDataURL('image/png');
};
