import { FrameObject, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../../game-constants';
import { ExplosionService } from '../../services/explosion.service';
import { GameShotService } from '../../services/game-shot.service';
import { AnimatedGameSprite } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';
import { ShipType } from './ship-type.enum';

export class Ship extends AnimatedGameSprite {
  shotPower = 1;
  shotSpeed: number;
  lastShot = 0;
  autoFire = false;
  maxEnergy: number;

  private elapsed = 0;
  private rotationTarget = 0;

  // eslint-disable-next-line max-params
  constructor(
    readonly shipType: ShipType,
    private readonly shotService: GameShotService,
    explosion: ExplosionService,
    speed: number,
    textures: Texture[] | FrameObject[],
  ) {
    super(shipType as unknown as ObjectType, explosion, speed, textures);

    this.maxEnergy = GAME_CONFIG.ships[this.shipType].energy;
    this.energy = this.maxEnergy;
    this.shotSpeed = GAME_CONFIG.ships[this.shipType].shotSpeed;
  }

  override get energy(): number {
    return super.energy ?? 0;
  }

  override set energy(value: number) {
    super.energy = Math.min(value, this.maxEnergy);
  }

  shot(): void {
    this.shotService.shot(this.shotPower, this, this.speed <= 0);
  }

  override update(ticker: Ticker): void {
    const previousX = this.x;
    const previousY = this.y;

    super.update(ticker);

    this.elapsed += Math.floor(ticker.deltaMS);
    const check = Math.floor(this.elapsed);
    // todo: check if we want two power ups for speed
    // eslint-disable-next-line no-magic-numbers
    if (this.autoFire && check - this.lastShot > 1000 / this.shotSpeed && check !== this.lastShot) {
      this.lastShot = check;
      this.shot();
    }

    if (this.shipType === ShipType.enemy) {
      const deltaX = this.x - previousX;
      const deltaY = this.y - previousY;

      if (deltaX === 0 && deltaY === 0) {
        this.rotationTarget = 0;
      } else {
        const angle = Math.atan2(deltaX, deltaY);
        // eslint-disable-next-line no-magic-numbers
        const maxTilt = Math.PI / 5;
        this.rotationTarget = Math.max(Math.min(angle, maxTilt), -maxTilt);
      }

      // eslint-disable-next-line no-magic-numbers
      const smoothing = 0.15;
      this.rotation += (this.rotationTarget - this.rotation) * smoothing;
    }
  }
}
