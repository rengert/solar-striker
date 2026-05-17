import { FrameObject, Texture, Ticker } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { AnimatedGameSprite, SPEED_SCALE } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';

export class OrbitalRocket extends AnimatedGameSprite {
  readonly #vx: number;
  readonly #vy: number;

  constructor(
    explosion: ExplosionService,
    vx: number,
    vy: number,
    textures: Texture[] | FrameObject[],
  ) {
    // speed=0 so the base class adds no default vertical movement
    super(ObjectType.rocket, explosion, 0, textures);
    this.#vx = vx;
    this.#vy = vy;
    this.energy = 1;
  }

  override update(ticker: Ticker): void {
    super.update(ticker);
    if (this.destroyed || this.destroying) {
      return;
    }
    this.x += this.#vx * ticker.deltaMS * SPEED_SCALE;
    this.y += this.#vy * ticker.deltaMS * SPEED_SCALE;
  }
}
