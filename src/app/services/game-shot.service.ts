import { Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { Rocket } from '../models/pixijs/rocket';
import { Ship } from '../models/pixijs/ship';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';
import { ObjectService } from './object.service';

@Injectable()
export class GameShotService {
  private laserAnimation: Texture[] | undefined;

  constructor(
    private readonly application: ApplicationService,
    private readonly explosionService: ExplosionService,
    private readonly object: ObjectService,
  ) {
  }

  async init(): Promise<void> {
    if (!this.laserAnimation) {
      const laser = await Assets.load<Spritesheet>('assets/game/laser.json');
      const laserAnimations: Record<string, Texture[]> = laser.animations;
      this.laserAnimation = laserAnimations['laser'];
    }
  }

  shot(power: number, ship: Ship, up: boolean): void {
    const { x, y } = ship;
    for (let i = 1; i <= power; i++) {
      const shot = new Rocket(this.explosionService, up ? -GAME_CONFIG.ships[ship.shipType].rocketSpeed : GAME_CONFIG.ships[ship.shipType].rocketSpeed, this.laserAnimation !);
      shot.reference = ship;
      shot.animationSpeed = 0.167;
      shot.play();
      shot.rotation = up ? 0 : Math.PI;
      shot.anchor.set(0.5);
      if ((power === 1) || (power === 3 && i === 2)) {
        shot.x = x;
        shot.y = y - 22;
      } else if (power > 1 && i === 1) {
        shot.x = x - 22;
        shot.y = y - 6;
      } else {
        shot.x = x + 22;
        shot.y = y - 6;
      }

      this.object.add(shot);
      this.application.stage.addChild(shot);
    }
  }

  update(): void {
    //
  }
}
