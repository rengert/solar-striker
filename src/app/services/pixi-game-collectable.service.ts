import { Application, Assets, Spritesheet, Texture } from 'pixi.js';
import { PowerUp, PowerUpSprite } from '../models/pixijs/power-up-sprite';
import { Ship } from '../models/pixijs/ship';

export class PixiGameCollectableService {
  private collectables: PowerUpSprite[] = [];

  private powerUpSpeedTexture!: Texture[];
  private powerUpPowerTexture!: Texture[];

  constructor(private readonly app: Application) {
    Assets.add('power-up-1', 'assets/power-up-1.json');
    Assets.add('power-up-2', 'assets/power-up-2.json');
  }

  async init(): Promise<void> {
    const powerUp1 = await Assets.load<Spritesheet>('assets/power-up-1.json');
    this.powerUpSpeedTexture = powerUp1.animations['power-up-1'];

    const powerUp2 = await Assets.load<Spritesheet>('assets/power-up-2.json');
    this.powerUpPowerTexture = powerUp2.animations['power-up-2'];
  }

  spawn(x: number, y: number): void {
    const rand = Math.random();
    if (rand > 0.1) {
      return;
    }
    const type = Math.random() > 0.5 ? PowerUp.Speed : PowerUp.Shot;
    const texture = (type === PowerUp.Speed)
      ? this.powerUpSpeedTexture
      : this.powerUpPowerTexture;
    const powerUp = new PowerUpSprite(1, texture, type);
    powerUp.animationSpeed = 0.167;
    powerUp.play();
    powerUp.anchor.set(0.5);
    powerUp.x = x;
    powerUp.y = y;
    this.app.stage.addChild(powerUp);
    this.collectables.push(powerUp);
  }

  collect(ship: Ship): void {
    if (!ship || ship.destroyed) {
      return;
    }

    const powerUp = this.collectables.find(collectable => !collectable.destroyed && ship.hit(collectable));
    if (powerUp) {
      if (powerUp.type === PowerUp.Speed) {
        ship.shotSpeed += 0.1;
      }
      if (powerUp.type === PowerUp.Shot) {
        ship.shotPower++;
      }
      powerUp.destroy();
      this.collectables = this.collectables.filter(collectable => !collectable.destroyed);
    }
  }
}
