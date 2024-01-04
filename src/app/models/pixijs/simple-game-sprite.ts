import { Sprite, Texture } from 'pixi.js';
import { hit } from '../../utils/sprite.util';

export class GameSprite extends Sprite {
  private readonly speed: number = 1;

  constructor(speed: number, texture: Texture) {
    super(texture);

    this.speed = speed;
  }

  update(delta: number): void {
    this.rotation += 0.015 * delta;
    this.y += delta * this.speed;
  }

  hit(object2: Sprite): boolean {
    return hit(this, object2);
  }
}
