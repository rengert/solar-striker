import { inject, Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { ExplosionService } from './explosion.service';
import { GameShotService } from './game-shot.service';
import { ObjectService } from './object.service';
import { PlayerShipService } from './player-ship.service';
import { ShipUpgradeService } from './ship-upgrade.service';
import { UpdatableService } from './updatable.service';

@Injectable()
export class GameShipService extends UpdatableService {
  #ship?: Ship;

  private readonly object = inject(ObjectService);

  private shipAnimation: Texture[] | undefined;
  private readonly explosionService = inject(ExplosionService);
  private readonly gameShot = inject(GameShotService);
  private readonly shipUpgrades = inject(ShipUpgradeService);
  private readonly playerShip = inject(PlayerShipService);

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

    this.applyUpgrades();
  }

  update(): void {
    // nothing to do here
  }

  applyUpgrades(): void {
    if (!this.#ship) {
      return;
    }

    this.playerShip.applyToShip(this.#ship);
    this.shipUpgrades.applyToShip(this.#ship);
  }
}
