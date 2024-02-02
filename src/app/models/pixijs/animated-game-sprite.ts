import { AnimatedSprite, FrameObject, Texture } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { ObjectModelType } from '../../services/object.service';
import { hit } from '../../utils/sprite.util';
import { ObjectType } from './object-type.enum';

export class AnimatedGameSprite extends AnimatedSprite {
  protected readonly speed: number = 1;

  protected _energy: number | undefined;
  reference: ObjectModelType | undefined;
  destroying = false;
  targetX?: number;

  // eslint-disable-next-line max-params
  constructor(
    readonly type: ObjectType,
    private readonly explosion: ExplosionService | null,
    speed: number,
    textures: Texture[] | FrameObject[],
    autoUpdate?: boolean) {
    super(textures, autoUpdate);

    this.speed = speed;
  }

  get energy(): number | undefined {
    return this._energy;
  }

  set energy(value: number) {
    this._energy = value;
  }

  explode(): void {
    void this.explosion?.explode(this.x, this.y);
    this.destroying = true;
  }

  override update(delta: number): void {
    if (this.destroying && !this.destroyed) {
      this.destroy();
      return;
    }
    super.update(delta);

    this.y += delta * this.speed;

    if (this.targetX && this.x !== this.targetX) {
      const direction = this.targetX > this.x ? 1 : -1;
      this.x += direction * this.getSpeed(this.targetX, this.x);
    }
  }

  hit(object2: ObjectModelType): boolean {
    return hit(this, object2);
  }


  private getSpeed(targetX: number, x: number): number {
    const distance = Math.abs(targetX - x);
    const speed = distance / 2;
    return Math.min(speed, 5);
  }
}
