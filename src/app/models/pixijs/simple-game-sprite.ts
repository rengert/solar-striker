import { Sprite, Text, Texture, Ticker } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { ObjectModelType } from '../../services/object.service';
import { hit } from '../../utils/sprite.util';
import { ObjectType } from './object-type.enum';

export class GameSprite extends Sprite {
  power = 1;
  reference: ObjectModelType | undefined;
  destroying = false;

  private _energy: number | undefined;

  private readonly ySpeed: number;
  private readonly xSpeed: number;
  private energyLabel: Text | undefined;

  constructor(
    readonly type: ObjectType,
    private readonly explosion: ExplosionService,
    {
      speed,
      texture,
      hasEnergy,
    }: {
      speed: number;
      texture: Texture;
      hasEnergy?: boolean;
    },
  ) {
    super(texture);

    this.ySpeed = Math.random() * speed;
    // eslint-disable-next-line no-magic-numbers
    this.xSpeed = (Math.random() * speed) / 2;

    if (hasEnergy) {
      const energyLabel = new Text({
        text: '',
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fontWeight: 'bold',
          fill: 0xffffff,
          stroke: {
            color: 0x000000,
            width: 3,
          },
          align: 'center',
        },
      });
      this.setEnergyLabel(energyLabel);
    }
  }

  get energy(): number | undefined {
    return this._energy;
  }

  set energy(value: number | undefined) {
    this._energy = value;
    this.updateEnergyLabel();
  }

  private setEnergyLabel(label: Text): void {
    this.energyLabel = label;
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

  update(ticker: Ticker): void {
    const delta = ticker.deltaMS;
    // eslint-disable-next-line no-magic-numbers
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
