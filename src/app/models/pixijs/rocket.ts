import { FrameObject, Texture, Ticker } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { AnimatedGameSprite } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';

const ACCEL_DURATION_MS = 500;
// Matches the speed scale factor used in AnimatedGameSprite.update() for y-movement
const SPEED_SCALE = 0.2;

export class Rocket extends AnimatedGameSprite {
  #elapsed = 0;

  constructor(
    explosion: ExplosionService,
    speed: number,
    textures: Texture[] | FrameObject[]) {
    super(ObjectType.rocket, explosion, speed, textures);

    this.energy = 1;
  }

  override update(ticker: Ticker): void {
    this.#elapsed += ticker.deltaMS;
    super.update(ticker);
    if (this.destroyed) {
      return;
    }
    const accelFactor = Math.min(this.#elapsed / ACCEL_DURATION_MS, 1);
    if (accelFactor < 1) {
      this.y += ticker.deltaMS * this.speed * SPEED_SCALE * (accelFactor - 1);
    }
  }
}
