import { Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';
import { GameShotService } from './game-shot.service';
import { ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';

@Injectable()
export class GameShipService extends UpdatableService {
  #ship?: Ship;

  private shipAnimation: Texture[] | undefined;

  constructor(
    private readonly application: ApplicationService,
    private readonly explosionService: ExplosionService,
    private readonly gameShot: GameShotService,
    private readonly object: ObjectService,
  ) {
    super();
  }

  async init(): Promise<void> {
    if (!this.shipAnimation) {
      const ship = await Assets.load<Spritesheet>('assets/game/ship/ship_blue.json');
      const animations: Record<string, Texture[]> = ship.animations;
      this.shipAnimation = animations['ship'];
    }
  }

  get instance(): Ship {
    if (!this.#ship) {
      throw new Error('Where is my ship?');
    }
    return this.#ship;
  }

  spawn(): void {
    this.#ship = new Ship(ShipType.ship, this.gameShot, this.explosionService, 0, this.shipAnimation !);
    this.#ship.animationSpeed = 0.167;
    this.#ship._width = 20;
    this.#ship._height = 20;
    this.#ship.play();
    this.#ship.x = Math.floor(this.application.screen.width / 2);
    this.#ship.y = this.application.screen.height - 100;
    this.object.add(this.#ship);
    this.application.stage.addChild(this.#ship);
  }

  update(): void {
    // nothing to do here
  }
}
