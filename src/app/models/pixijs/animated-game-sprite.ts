import { AnimatedSprite, FrameObject, Sprite, Texture } from 'pixi.js';
import { hit } from '../../utils/sprite.util';

export class AnimatedGameSprite extends AnimatedSprite {
  private readonly speed: number = 1;

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
  }

  hit(object2: Sprite): boolean {
    return hit(this, object2);
  }
}
