import { Sprite } from 'pixi.js';

export function hit(spriteA: Sprite, spriteB: Sprite): boolean {
  const bounds1 = spriteA.getBounds();
  const bounds2 = spriteB.getBounds();

  return bounds1.x < bounds2.x + bounds2.width
    && bounds1.x + bounds1.width > bounds2.x
    && bounds1.y < bounds2.y + bounds2.height
    && bounds1.y + bounds1.height > bounds2.y;
}
