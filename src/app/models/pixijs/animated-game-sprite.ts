import { AnimatedSprite, FrameObject, Sprite, Texture } from 'pixi.js';
import { hit } from '../../utils/sprite.util';

export class AnimatedGameSprite extends AnimatedSprite {
  protected readonly speed: number = 1;

  targetX?: number;

  constructor(
    speed: number,
    textures: Texture[] | FrameObject[],
    autoUpdate?: boolean) {
    super(textures, autoUpdate);

    this.speed = speed;
  }

  override update(delta: number): void {
    super.update(delta);

    this.y += delta * this.speed;

    if (this.targetX && this.x !== this.targetX) {
      const direction = this.targetX > this.x ? 1 : -1;
      this.x += direction * this.getSpeed(this.targetX, this.x);
    }
  }

  hit(object2: Sprite): boolean {
    return hit(this, object2);
  }

  private getSpeed(targetX: number, x: number): number {
    const distance = Math.abs(targetX - x);
    const speed = distance / 2;
    return Math.min(speed, 5);
  }
}
