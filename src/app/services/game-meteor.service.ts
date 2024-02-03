import { Injectable } from '@angular/core';
import { Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { GameSprite } from '../models/pixijs/simple-game-sprite';
import { BaseService } from './base.service';
import { ExplosionService } from './explosion.service';

@Injectable()
export class GameMeteorService extends BaseService {
  private elapsed = 0;
  private lastMeteorSpawn = -1;
  private readonly textures: Texture[];

  constructor(private readonly explosionService: ExplosionService) {
    super();

    this.textures = [
      Texture.from('assets/game/meteors/meteorBrown_small1.png'),
      Texture.from('assets/game/meteors/meteorBrown_small2.png'),
      Texture.from('assets/game/meteors/meteorGrey_small1.png'),
      Texture.from('assets/game/meteors/meteorGrey_small2.png'),
    ];
  }

  update(delta: number, level: number): void {
    this.elapsed += delta;

    this.object.meteors()
      .filter(meteor => meteor.y > this.application.screen.height + 50)
      .forEach(meteor => meteor.destroy());


    const check = Math.floor(this.elapsed);
    if (((check % Math.floor(60 / (GAME_CONFIG.meteor.autoSpawnSpeed + (0.1 * (level - 1))))) === 0)
      && (check !== this.lastMeteorSpawn)) {
      this.lastMeteorSpawn = check;
      this.spawn(level);
    }
  }

  private spawn(level: number): void {
    const position = Math.floor(Math.random() * this.application.screen.width - 20) + 10;
    const meteor = new GameSprite(
      ObjectType.meteor,
      this.explosionService,
      1 + (0.25 * (level)),
      this.textures[Math.floor(Math.random() * this.textures.length)],
    );
    meteor.anchor.set(0.5);
    meteor.x = position;
    meteor.y = 10;
    meteor.width += Math.random() * 20;
    meteor.height += Math.random() * 20;
    meteor.energy = 10;
    this.object.add(meteor);
    this.application.stage.addChild(meteor);
  }
}
