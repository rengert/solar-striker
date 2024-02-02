import { ObjectModelType } from '../services/object.service';

export function hit(spriteA: ObjectModelType, spriteB: ObjectModelType): boolean {
  if (spriteA.destroyed || spriteB.destroyed || spriteA.destroying || spriteB.destroying) {
    return false;
  }

  if (spriteA.reference === spriteB || spriteB.reference === spriteA) {
    return false;
  }

  const bounds1 = spriteA.getBounds();
  const bounds2 = spriteB.getBounds();

  const itemHit = bounds1.x < bounds2.x + bounds2.width
    && bounds1.x + bounds1.width > bounds2.x
    && bounds1.y < bounds2.y + bounds2.height
    && bounds1.y + bounds1.height > bounds2.y;
  if (itemHit) {
    if (spriteA.energy !== undefined) {
      spriteA.energy -= 1;
      if (spriteA.energy <= 0) {
        spriteA.explode();
      }
    }
    if (spriteB.energy !== undefined) {
      spriteB.energy -= 1;
      if (spriteB.energy <= 0) {
        spriteB.explode();
      }
    }
  }
  return itemHit;
}
