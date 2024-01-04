import { Sprite, Texture } from 'pixi.js';
import { hit } from '../../utils/sprite.util';

export class GameSprite extends Sprite {
  private readonly ySpeed: number;
  private readonly xSpeed: number;

  constructor(speed: number, texture: Texture) {
    super(texture);

    this.ySpeed = Math.random() * speed;
    this.xSpeed = Math.random() * speed / 2;
  }

  update(delta: number): void {
    this.rotation += 0.015 * delta;
    this.y += delta * this.ySpeed;
    this.x += delta * this.xSpeed;
  }

  hit(object2: Sprite): boolean {
    return hit(this, object2);
  }
}
