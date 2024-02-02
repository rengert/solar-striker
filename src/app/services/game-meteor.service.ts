import { Injectable } from '@angular/core';
import { Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { GameSprite } from '../models/pixijs/simple-game-sprite';
import { BaseService } from './base.service';

@Injectable()
export class GameMeteorService extends BaseService {
  #meteors: GameSprite[] = [];

  private elapsed = 0;
  private lastMeteorSpawn = -1;
  private readonly textures: Texture[];

  constructor() {
    super();

    this.textures = [
      Texture.from('assets/game/meteors/meteorBrown_small1.png'),
      Texture.from('assets/game/meteors/meteorBrown_small2.png'),
      Texture.from('assets/game/meteors/meteorGrey_small1.png'),
      Texture.from('assets/game/meteors/meteorGrey_small2.png'),
    ];
  }

  get meteors(): GameSprite[] {
    return [...this.#meteors];
  }

  update(delta: number, level: number): void {
    this.elapsed += delta;

    this.#meteors = this.#meteors.filter(meteor => !meteor.destroyed);
    this.#meteors
      .filter(meteor => meteor.y > this.application.screen.height + 50)
      .forEach(meteor => meteor.destroy());
    this.#meteors = this.#meteors.filter(meteor => !meteor.destroyed);

    this.#meteors.forEach(meteor => meteor.update(delta));

    const check = Math.floor(this.elapsed);
    if (((check % Math.floor(60 / (GAME_CONFIG.meteor.autoSpawnSpeed + (0.1 * (level - 1))))) === 0)
      && (check !== this.lastMeteorSpawn)) {
      this.lastMeteorSpawn = check;
      this.spawn(level);
    }
  }

  hit(shots: AnimatedGameSprite[]): number {
    for (const shot of shots.filter(s => !s.destroyed)) {
      const hit = this.meteors.find(meteor => !meteor.destroyed && meteor.hit(shot));
      if (hit) {
        this.explode(hit.x, hit.y);
        shot.destroy();

        if (hit.power === 0) {
          hit.destroy();
        }
      }
    }

    return 0;
  }

  kill(ship: AnimatedGameSprite | undefined): boolean {
    if (!ship || ship.destroyed) {
      return false;
    }

    const hit = this.meteors.find(enemy => !enemy.destroyed && ship.hit(enemy));
    if (hit) {
      this.explode(hit.x, hit.y);
      return true;
    }
    return false;
  }

  private spawn(level: number): void {
    const position = Math.floor(Math.random() * this.application.screen.width - 20) + 10;
    const meteor = new GameSprite(
      1 + (0.25 * (level)),
      this.textures[Math.floor(Math.random() * this.textures.length)],
    );
    meteor.anchor.set(0.5);
    meteor.x = position;
    meteor.y = 10;
    meteor.width += Math.random() * 20;
    meteor.height += Math.random() * 20;
    meteor.power = 10;
    this.#meteors.push(meteor);
    this.application.stage.addChild(meteor);
  }
}