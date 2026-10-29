/* eslint-disable no-magic-numbers */
import { Texture } from 'pixi.js';

function createCanvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d')!);
  return Texture.from(canvas);
}

/** Soft white dot, tinted per particle. */
export function createGlowTexture(): Texture {
  return createCanvasTexture(32, 32, (ctx) => {
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
  });
}

/** White ring used for shockwaves. */
export function createRingTexture(): Texture {
  return createCanvasTexture(64, 64, (ctx) => {
    const gradient = ctx.createRadialGradient(32, 32, 20, 32, 32, 31);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  });
}

/** Tileable layer of random specks for parallax dust. */
export function createDustTexture(count: number, maxRadius: number): Texture {
  return createCanvasTexture(256, 256, (ctx) => {
    for (let i = 0; i < count; i++) {
      const radius = 0.5 + Math.random() * maxRadius;
      ctx.fillStyle = `rgba(255,${220 + Math.floor(Math.random() * 35)},180,${0.3 + Math.random() * 0.6})`;
      ctx.beginPath();
      // keep specks away from the edges so the tile seams stay invisible
      ctx.arc(maxRadius + Math.random() * (256 - 2 * maxRadius), maxRadius + Math.random() * (256 - 2 * maxRadius), radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Dark edges that frame the play field. */
export function createVignetteTexture(width: number, height: number): Texture {
  return createCanvasTexture(width, height, (ctx) => {
    const radius = Math.max(width, height) * 0.75;
    const gradient = ctx.createRadialGradient(width / 2, height / 2, radius * 0.35, width / 2, height / 2, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(10,0,20,0.75)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
}
