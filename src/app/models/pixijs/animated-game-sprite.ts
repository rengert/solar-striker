import { AnimatedSprite, FrameObject, Text, Texture, Ticker } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { ObjectModelType } from '../../services/object.service';
import { hit } from '../../utils/sprite.util';
import { ObjectType } from './object-type.enum';

// eslint-disable-next-line no-magic-numbers
const TWO_PI = Math.PI * 2;

const MULTI_EXPLOSION_OFFSET_FRACTION = 0.4;
const HALF_DIVISOR = 2;
export const MULTI_EXPLOSION_INTERVAL_MS = 150;

interface ChainExplosionCenter {
  readonly x: number;
  readonly y: number;
  readonly halfW: number;
  readonly halfH: number;
}

export interface LoopData {
  readonly startX: number;
  readonly startY: number;
  readonly radius: number;
  // eslint-disable-next-line no-magic-numbers
  readonly direction: 1 | -1;
  readonly speed: number;
  progress: number;
}

export class AnimatedGameSprite extends AnimatedSprite {
  power = 1;
  isBoss = false;
  reference: ObjectModelType | undefined;
  destroying = false;
  explosionCount = 1;
  explosionScale = 1;
  targetX?: number;
  xSpeed: number = 1;
  loopData: LoopData | undefined;

  get isShielded(): boolean {
    return false;
  }

  protected readonly speed: number = 1;
  private _initialEnergy: number | undefined;
  private energyLabel: Text | undefined;

  constructor(
    readonly type: ObjectType,
    protected readonly explosion: ExplosionService | null,
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
    if (this._initialEnergy === undefined) {
      this._initialEnergy = value;
    }
    this._energy = value;
    this.updateEnergyLabel();
  }

  get initialEnergy(): number | undefined {
    return this._initialEnergy;
  }

  enableEnergyDisplay(): void {
    this.energyLabel = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: {
          color: 0x000000,
          // eslint-disable-next-line no-magic-numbers
          width: 3,
        },
        align: 'center',
      },
    });
    // eslint-disable-next-line no-magic-numbers
    this.energyLabel.anchor.set(0.5);
    this.energyLabel.position.set(0, 0);
    this.addChild(this.energyLabel);
    this.updateEnergyLabel();
  }

  private updateEnergyLabel(): void {
    if (!this.energyLabel) {
      return;
    }
    this.energyLabel.text = this._energy?.toString() ?? '';
    this.energyLabel.visible = this._energy !== undefined;
  }

  explode(): void {
    if (this.explosionCount > 1) {
      const center: ChainExplosionCenter = {
        x: this.x,
        y: this.y,
        halfW: this.width / HALF_DIVISOR,
        halfH: this.height / HALF_DIVISOR,
      };
      void this.triggerChainExplosion(center, this.explosionCount);
    } else {
      void this.explosion?.explode(this.x, this.y, this.explosionScale);
    }
    this.destroying = true;
  }

  private async triggerChainExplosion(
    center: ChainExplosionCenter,
    count: number,
  ): Promise<void> {
    for (let i = 0; i < count; i++) {
      if (i > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, MULTI_EXPLOSION_INTERVAL_MS));
        if (this.destroyed) {
          return;
        }
      }
      // eslint-disable-next-line no-magic-numbers
      const offsetX = (Math.random() * 2 - 1) * center.halfW * MULTI_EXPLOSION_OFFSET_FRACTION;
      // eslint-disable-next-line no-magic-numbers
      const offsetY = (Math.random() * 2 - 1) * center.halfH * MULTI_EXPLOSION_OFFSET_FRACTION;
      void this.explosion?.explode(center.x + offsetX, center.y + offsetY, this.explosionScale);
    }
  }

  override update(ticker: Ticker): void {
    if (this.destroying && !this.destroyed) {
      this.destroy();
      return;
    }
    super.update(ticker);

    if (this.loopData) {
      this.loopData.progress += ticker.deltaMS * this.loopData.speed;
      this.x =
        this.loopData.startX +
        this.loopData.radius * Math.sin(this.loopData.progress) * this.loopData.direction;
      this.y = this.loopData.startY - this.loopData.radius * (1 - Math.cos(this.loopData.progress));
      if (this.loopData.progress >= TWO_PI) {
        this.loopData = undefined;
      }
    } else {
      // eslint-disable-next-line no-magic-numbers
      this.y += ticker.deltaMS * this.speed * 0.2;

      if (this.targetX && this.x !== this.targetX) {
        // eslint-disable-next-line no-magic-numbers
        const direction = this.targetX > this.x ? 1 : -1;
        this.x += direction * this.getSpeed(this.targetX, this.x);
      }
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
    return Math.min(speed, 5) * this.xSpeed;
  }
}
