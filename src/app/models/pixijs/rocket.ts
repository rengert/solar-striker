import { FrameObject, Texture, Ticker } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { AnimatedGameSprite, SPEED_SCALE } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';

const ACCEL_DURATION_MS = 500;
const HALF_DIVISOR = 2;

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
    const previousElapsed = this.#elapsed;
    this.#elapsed = previousElapsed + ticker.deltaMS;

    super.update(ticker);
    if (this.destroyed) {
      return;
    }

    const rampStart = Math.min(previousElapsed, ACCEL_DURATION_MS);
    const rampEnd = Math.min(this.#elapsed, ACCEL_DURATION_MS);

    if (rampEnd > rampStart) {
      const deficitIntegral =
        (rampEnd - rampStart) -
        (rampEnd * rampEnd - rampStart * rampStart) / (HALF_DIVISOR * ACCEL_DURATION_MS);
      this.y -= this.speed * SPEED_SCALE * deficitIntegral;
    }
  }
}
