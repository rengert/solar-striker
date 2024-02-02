import { FrameObject, Texture } from 'pixi.js';
import { GameShotService } from '../../services/game-shot.service';
import { AnimatedGameSprite } from './animated-game-sprite';
import { ShipType } from './ship-type.enum';

export class Ship extends AnimatedGameSprite {
  shotPower = 1;
  shotSpeed = 1;
  lastShot = 0;
  autoFire = false;

  #energy = 10;

  private elapsed = 0;

  // eslint-disable-next-line max-params
  constructor(
    readonly type: ShipType,
    private readonly shotService: GameShotService,
    speed: number,
    textures: Texture[] | FrameObject[],
    autoUpdate?: boolean) {
    super(speed, textures, autoUpdate);
  }

  set energy(value: number) {
    this.#energy = Math.min(value, 10);
  };

  get energy(): number {
    return this.#energy;
  }

  shot(): void {
    this.shotService.shot(this.shotPower, this, this.speed <= 0);
  }

  override update(delta: number): void {
    super.update(delta);

    this.elapsed += delta;

    const check = Math.floor(this.elapsed);
    // todo: check if we want two power ups for speed
    if (this.autoFire && (check % Math.floor(60 / this.shotSpeed) === 0) && (check !== this.lastShot)) {
      this.lastShot = check;
      this.shot();
    }
  }
}
