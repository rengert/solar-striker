import { AnimatedSprite, FrameObject, Text, Texture, Ticker } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { ObjectModelType } from '../../services/object.service';
import { hit } from '../../utils/sprite.util';
import { ObjectType } from './object-type.enum';

// eslint-disable-next-line no-magic-numbers
const TWO_PI = Math.PI * 2;

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
  targetX?: number;
  xSpeed: number = 1;
  loopData: LoopData | undefined;

  protected readonly speed: number = 1;
  private _initialEnergy: number | undefined;
  private energyLabel: Text | undefined;

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
    void this.explosion?.explode(this.x, this.y);
    this.destroying = true;
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
