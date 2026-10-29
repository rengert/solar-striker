import { inject, Injectable } from '@angular/core';
import { Assets, Sprite, Spritesheet, Texture, Ticker } from 'pixi.js';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { ExplosionService } from './explosion.service';
import { GameShotService } from './game-shot.service';
import { ObjectService } from './object.service';
import { ParticleService } from './particle.service';
import { PlayerShipService } from './player-ship.service';
import { ShipUpgradeService } from './ship-upgrade.service';
import { UpdatableService } from './updatable.service';
import { createRingTexture } from '../utils/texture.util';
import { THE_MIDDLE } from '../game-constants';

const SHIELD_COLOR = 0x00ccff;
const DOUBLE = 2;
const SHIELD_DIAMETER = 64;
const SHIELD_PULSE_SPEED = 0.008;
const SHIELD_PULSE_AMOUNT = 0.25;
// shield blinks during its last moments so the player sees it running out
const SHIELD_BLINK_MS = 1500;
const SHIELD_BLINK_INTERVAL_MS = 120;

@Injectable()
export class GameShipService extends UpdatableService {
  #ship?: Ship;
  #shieldBubble?: Sprite;

  private readonly object = inject(ObjectService);

  private shipAnimation: Texture[] | undefined;
  private readonly explosionService = inject(ExplosionService);
  private readonly gameShot = inject(GameShotService);
  private readonly shipUpgrades = inject(ShipUpgradeService);
  private readonly playerShip = inject(PlayerShipService);
  private readonly particles = inject(ParticleService);

  get instance(): Ship {
    if (!this.#ship) {
      throw new Error('Where is my ship?');
    }
    return this.#ship;
  }

  async init(): Promise<void> {
    if (!this.shipAnimation) {
      const ship = await Assets.load<Spritesheet>('ship');
      const animations: Record<string, Texture[]> = ship.animations;
      this.shipAnimation = animations['ship'];
    }
  }

  spawn(): void {
    this.#ship = new Ship(
      ShipType.ship,
      this.gameShot,
      this.explosionService,
      0,
      this.shipAnimation!,
    );
    this.#ship.animationSpeed = 0.08;
    this.#ship.width = 40;
    this.#ship.height = 40;
    this.#ship.play();
    // eslint-disable-next-line no-magic-numbers
    this.#ship.x = Math.floor(this.application.screen.width / 2);
    // eslint-disable-next-line no-magic-numbers
    this.#ship.y = this.application.screen.height - 100;
    this.object.add(this.#ship);
    this.application.stage.addChild(this.#ship);

    this.#shieldBubble?.destroy();
    this.#shieldBubble = new Sprite(createRingTexture());
    this.#shieldBubble.anchor.set(THE_MIDDLE);
    this.#shieldBubble.tint = SHIELD_COLOR;
    this.#shieldBubble.blendMode = 'add';
    this.#shieldBubble.width = SHIELD_DIAMETER;
    this.#shieldBubble.height = SHIELD_DIAMETER;
    this.#shieldBubble.visible = false;
    this.application.stage.addChild(this.#shieldBubble);

    this.applyUpgrades();
  }

  /* eslint-disable no-magic-numbers */
  update(ticker: Ticker): void {
    const ship = this.#ship;
    if (!ship || ship.destroyed || ship.destroying) {
      if (this.#shieldBubble) {
        this.#shieldBubble.visible = false;
      }
      return;
    }
    this.updateShieldBubble(ship, ticker.lastTime);
    // engine flame: hot core plus a wider orange plume
    const x = ship.x - Math.sin(ship.rotation) * 14;
    const y = ship.y + 16;
    const down = Math.PI / 2 - ship.rotation;
    this.particles.emit({ x, y, color: 0xfff2b0, angle: down, spread: 0.2, speed: 0.18, life: 160, scale: 0.6, endScale: 0.15 });
    this.particles.emit({
      x, y, color: 0xff7a20, count: 2, angle: down, spread: 0.5, speed: 0.16, life: 380, scale: 0.7, endScale: 0.05,
    });
  }
  /* eslint-enable no-magic-numbers */

  private updateShieldBubble(ship: Ship, now: number): void {
    const bubble = this.#shieldBubble!;
    const blinkOff = ship.shieldTicks < SHIELD_BLINK_MS && Math.floor(ship.shieldTicks / SHIELD_BLINK_INTERVAL_MS) % DOUBLE === 1;
    bubble.visible = ship.isShielded && !blinkOff;
    bubble.position.copyFrom(ship.position);
    bubble.alpha = 1 - SHIELD_PULSE_AMOUNT * (1 + Math.sin(now * SHIELD_PULSE_SPEED));
  }

  applyUpgrades(): void {
    if (!this.#ship) {
      return;
    }

    this.playerShip.applyToShip(this.#ship);
    this.shipUpgrades.applyToShip(this.#ship);
  }
}
