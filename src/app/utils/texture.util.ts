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

/** Draws a shape at its spot and at every wrapped copy, so a size×size tile has no seams. */
function drawWrapped(size: number, draw: (dx: number, dy: number) => void): void {
  for (const dx of [-size, 0, size]) {
    for (const dy of [-size, 0, size]) {
      draw(dx, dy);
    }
  }
}

/** Dark space tile with stars; base for all non-desert themes. */
export function createStarfieldTexture(size = 512): Texture {
  return createCanvasTexture(size, size, (ctx) => {
    ctx.fillStyle = '#05030c';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.8})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() < 0.9 ? 1 : 2, 1);
    }
  });
}

/** Transparent tile of soft coloured gas clouds, meant to sit above the starfield. */
export function createNebulaTexture(size = 512): Texture {
  const colors = ['180,60,255', '255,60,160', '60,120,255', '60,220,255'];
  return createCanvasTexture(size, size, (ctx) => {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = size * (0.12 + Math.random() * 0.25);
      const color = colors[i % colors.length];
      drawWrapped(size, (dx, dy) => {
        const gradient = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, radius);
        gradient.addColorStop(0, `rgba(${color},0.35)`);
        gradient.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x + dx - radius, y + dy - radius, radius * 2, radius * 2);
      });
    }
  });
}

/** Transparent tile of shaded, lumpy rocks. */
export function createAsteroidTexture(size = 512, count = 12): Texture {
  return createCanvasTexture(size, size, (ctx) => {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 6 + Math.random() * 22;
      const corners = 7 + Math.floor(Math.random() * 4);
      const offsets = Array.from({ length: corners }, () => 0.7 + Math.random() * 0.3);
      const grey = 70 + Math.floor(Math.random() * 50);
      drawWrapped(size, (dx, dy) => {
        const gradient = ctx.createRadialGradient(x + dx - radius / 3, y + dy - radius / 3, 0, x + dx, y + dy, radius);
        gradient.addColorStop(0, `rgb(${grey + 60},${grey + 50},${grey + 40})`);
        gradient.addColorStop(1, `rgb(${grey / 3},${grey / 3},${grey / 3})`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        offsets.forEach((offset, corner) => {
          const angle = (corner / corners) * Math.PI * 2;
          ctx.lineTo(x + dx + Math.cos(angle) * radius * offset, y + dy + Math.sin(angle) * radius * offset);
        });
        ctx.fill();
      });
    }
  });
}

/** Big banded planet with an atmosphere glow. */
export function createPlanetTexture(diameter: number): Texture {
  const size = Math.round(diameter * 1.2);
  return createCanvasTexture(size, size, (ctx) => {
    const center = size / 2;
    const radius = diameter / 2;
    const glow = ctx.createRadialGradient(center, center, radius * 0.95, center, center, size / 2);
    glow.addColorStop(0, 'rgba(120,200,255,0.6)');
    glow.addColorStop(1, 'rgba(120,200,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#2a4f7a';
    ctx.fillRect(0, 0, size, size);
    for (let band = 0; band < 9; band++) {
      ctx.fillStyle = `rgba(${150 + band * 10},${180 - band * 8},255,0.12)`;
      ctx.fillRect(0, center - radius + band * (diameter / 9) + Math.random() * 10, size, diameter / 18);
    }
    // night side
    const shade = ctx.createRadialGradient(center - radius * 0.4, center - radius * 0.4, radius * 0.2, center, center, radius * 1.1);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,10,0.85)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  });
}
