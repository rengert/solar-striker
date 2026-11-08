import { FrameObject, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../../game-constants';
import { ExplosionService } from '../../services/explosion.service';
import { GameShotService } from '../../services/game-shot.service';
import { AnimatedGameSprite } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';
import { ShipType } from './ship-type.enum';

const SPREAD = 2;
const DOUBLE_SPREAD = 4;

export class Ship extends AnimatedGameSprite {
  shotPower = 1;
  shotSpeed: number;
  rocketSpeed: number;
  lastShot = 0;
  autoFire = false;
  maxEnergy: number;
  shieldTicks = 0;
  /** While > 0 every volley adds two diagonal shots. */
  spreadShotTicks = 0;
  /** Ship class trait: every volley fires the spread shot, no power-up needed. */
  permanentSpread = false;
  /** Extra shield time per shield power-up, from the hangar skill tree. */
  shieldBonusMs = 0;
  /** Power-ups closer than this (px) fly to the ship, from the hangar skill tree. */
  magnetRange = 0;

  /** Base stat used by ShipUpgradeService to add upgrade bonuses idempotently. */
  baseMaxEnergy: number;
  /** Base stat used by ShipUpgradeService to add upgrade bonuses idempotently. */
  baseShotSpeed: number;
  /** Base stat used by ShipUpgradeService to add upgrade bonuses idempotently. */
  baseShotPower: number;

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
    this.baseMaxEnergy = this.maxEnergy;
    this.energy = this.maxEnergy;
    this.shotSpeed = GAME_CONFIG.ships[this.shipType].shotSpeed;
    this.baseShotSpeed = this.shotSpeed;
    this.shotPower = 1;
    this.baseShotPower = 1;
    this.rocketSpeed = GAME_CONFIG.ships[this.shipType].rocketSpeed;
  }

  override get isShielded(): boolean {
    return this.shieldTicks > 0;
  }

  override get energy(): number {
    return super.energy ?? 0;
  }

  override set energy(value: number) {
    super.energy = Math.min(value, this.maxEnergy);
  }

  shot(): void {
    this.shotService.shot(this.shotPower, this, this.speed <= 0);
    const spreadPowerUp = this.spreadShotTicks > 0;
    if (spreadPowerUp || this.permanentSpread) {
      // a ship that always spreads gets a doubled fan from the power-up, so the pickup still counts
      this.shotService.fireSpread(this, spreadPowerUp && this.permanentSpread ? DOUBLE_SPREAD : SPREAD);
    }
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

    if (this.shieldTicks > 0) {
      this.shieldTicks = Math.max(0, this.shieldTicks - ticker.deltaMS);
    }
    this.spreadShotTicks = Math.max(0, this.spreadShotTicks - ticker.deltaMS);

    const deltaX = this.x - previousX;
    const deltaY = this.y - previousY;

    if (this.shipType === ShipType.enemy) {
      if (deltaX === 0 && deltaY === 0) {
        this.rotationTarget = 0;
      } else {
        const angle = Math.atan2(deltaX, deltaY);
        // eslint-disable-next-line no-magic-numbers
        const maxTilt = this.loopData ? Math.PI : Math.PI / 5;
        const clampedAngle = Math.min(Math.max(angle, -maxTilt), maxTilt);
        this.rotationTarget = -clampedAngle;
      }
      // eslint-disable-next-line no-magic-numbers
      const smoothing = this.loopData ? 0.1 : 0.025;
      this.rotation += (this.rotationTarget - this.rotation) * smoothing;
    } else {
      // eslint-disable-next-line no-magic-numbers
      if (Math.abs(deltaX) < 0.01) {
        this.rotationTarget = 0;
      } else {
        // eslint-disable-next-line no-magic-numbers
        const maxTilt = Math.PI / 8;
        // eslint-disable-next-line no-magic-numbers
        const normalizedMovement = Math.min(Math.max(deltaX / 5, -1), 1);
        this.rotationTarget = normalizedMovement * maxTilt;
      }
      // eslint-disable-next-line no-magic-numbers
      const smoothing = 0.1;
      this.rotation += (this.rotationTarget - this.rotation) * smoothing;
    }
  }
}
