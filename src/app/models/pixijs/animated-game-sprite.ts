import { AnimatedSprite, FrameObject, Texture, Ticker } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { ObjectModelType } from '../../services/object.service';
import { hit } from '../../utils/sprite.util';
import { ObjectType } from './object-type.enum';

export class AnimatedGameSprite extends AnimatedSprite {
  power = 1;
  reference: ObjectModelType | undefined;
  destroying = false;
  targetX?: number;
  protected readonly speed: number = 1;

  constructor(
    readonly type: ObjectType,
    private readonly explosion: ExplosionService | null,
    speed: number,
    textures: Texture[] | FrameObject[],
  ) {
    super(textures);

    this.speed = speed;
  }

  protected _energy: number | undefined;

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

  override update(ticker: Ticker): void {
    if (this.destroying && !this.destroyed) {
      this.destroy();
      return;
    }
    super.update(ticker);

    // eslint-disable-next-line no-magic-numbers
    this.y += ticker.deltaMS * this.speed * 0.2;

    if (this.targetX && this.x !== this.targetX) {
      // eslint-disable-next-line no-magic-numbers
      const direction = this.targetX > this.x ? 1 : -1;
      this.x += direction * this.getSpeed(this.targetX, this.x);
    }
  }

  hit(object2: ObjectModelType): boolean {
    return hit(this, object2);
  }

  private getSpeed(targetX: number, x: number): number {
    const distance = Math.abs(targetX - x);
    // eslint-disable-next-line no-magic-numbers
    const speed = distance / 2;
    // eslint-disable-next-line no-magic-numbers
    return Math.min(speed, 5);
  }
}
