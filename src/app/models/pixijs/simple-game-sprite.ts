import { Sprite, Texture } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { ObjectModelType } from '../../services/object.service';
import { hit } from '../../utils/sprite.util';
import { ObjectType } from './object-type.enum';

export class GameSprite extends Sprite {
  private readonly ySpeed: number;
  private readonly xSpeed: number;

  reference: ObjectModelType | undefined;
  energy: number | undefined;
  destroying = false;

  constructor(
    readonly type: ObjectType,
    private readonly explosion: ExplosionService,
    speed: number,
    texture: Texture,
  ) {
    super(texture);

    this.ySpeed = Math.random() * speed;
    this.xSpeed = Math.random() * speed / 2;
  }

  update(delta: number): void {
    this.rotation += Math.random() * 0.01 * delta;
    this.y += delta * this.ySpeed;
    this.x += delta * this.xSpeed;
  }

  hit(object2: ObjectModelType): boolean {
    return hit(this, object2);
  }

  explode(): void {
    void this.explosion.explode(this.x, this.y);
    this.destroying = true;
  }
}
