/* eslint-disable no-magic-numbers */
import { inject, Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { OFF_SCREEN_BUFFER } from '../game-constants';
import { OrbitalRocket } from '../models/pixijs/orbital-rocket';
import { Rocket } from '../models/pixijs/rocket';
import { Ship } from '../models/pixijs/ship';
import { ExplosionService } from './explosion.service';
import { ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';

const SHOT_OFFSETS: [number, number][][] = [
  [[0, -22]],
  [[-22, -6], [22, -6]],
  [[-22, -6], [0, -22], [22, -6]],
  [[-33, -6], [-11, -6], [11, -6], [33, -6]],
  [[-44, -6], [-22, -6], [0, -22], [22, -6], [44, -6]],
];

const ORBITAL_STRIKE_COUNT = 8;
const ORBITAL_STRIKE_SPEED = 3.0;

@Injectable()
export class GameShotService extends UpdatableService {
  private laserAnimation: Texture[] | undefined;

  private readonly explosionService = inject(ExplosionService);
  private readonly object = inject(ObjectService);

  async init(): Promise<void> {
    if (!this.laserAnimation) {
      const laser = await Assets.load<Spritesheet>('assets/game/laser.json');
      const laserAnimations: Record<string, Texture[]> = laser.animations;
      this.laserAnimation = laserAnimations['laser'];
    }
  }

  shot(power: number, ship: Ship, up: boolean): void {
    const { x, y } = ship;
    const speed = up ? -ship.rocketSpeed : ship.rocketSpeed;
    const offsets = SHOT_OFFSETS[power - 1];
    for (let i = 1; i <= power; i++) {
      const shot = new Rocket(this.explosionService, speed, this.laserAnimation!);
      shot.reference = ship;
      shot.animationSpeed = 0.167;
      shot.play();
      shot.rotation = up ? 0 : Math.PI;
      shot.anchor.set(0.5);
      const [dx, dy] = offsets[i - 1];
      shot.x = x + dx;
      shot.y = y + dy;

      this.object.add(shot);
      this.application.stage.addChild(shot);
    }
  }

  fireOrbitalStrike(ship: Ship): void {
    const { x, y } = ship;
    for (let i = 0; i < ORBITAL_STRIKE_COUNT; i++) {
      const angle = (i / ORBITAL_STRIKE_COUNT) * Math.PI * 2;
      const vx = Math.cos(angle) * ORBITAL_STRIKE_SPEED;
      const vy = Math.sin(angle) * ORBITAL_STRIKE_SPEED;
      const rocket = new OrbitalRocket(this.explosionService, vx, vy, this.laserAnimation!);
      rocket.reference = ship;
      rocket.animationSpeed = 0.167;
      rocket.play();
      rocket.rotation = angle;
      rocket.anchor.set(0.5);
      rocket.x = x;
      rocket.y = y;
      this.object.add(rocket);
      this.application.stage.addChild(rocket);
    }
  }

  update(): void {
    this.object
      .rockets()
      .filter((rocket) =>
        rocket.y < -OFF_SCREEN_BUFFER ||
        rocket.y > this.application.screen.height + OFF_SCREEN_BUFFER ||
        rocket.x < -OFF_SCREEN_BUFFER ||
        rocket.x > this.application.screen.width + OFF_SCREEN_BUFFER,
      )
      .forEach((rocket) => rocket.destroy());
  }
}
