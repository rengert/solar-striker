import { AnimatedSprite, Application } from 'pixi.js';
import { GameSprite } from '../models/pixijs/game-sprite';
import { GAME_CONFIG } from './pixi-game-constants';

export class PixiGameEnemyService {
  #enemies: GameSprite[] = [];

  private elapsed = 0;
  private lastEnemySpawn = -1;

  constructor(private readonly app: Application) {
    app.loader.add('assets/explosion.json').add('assets/enemy.json');
  }

  get enemies(): GameSprite[] {
    return [...this.#enemies];
  }

  update(delta: number, level: number): void {
    this.elapsed += delta;

    this.#enemies = this.#enemies.filter(enemy => !enemy.destroyed);
    this.#enemies
      .filter(enemy => enemy.y > this.app.screen.height + 50)
      .forEach(enemy => {
        enemy.y = 0;
      });

    const check = Math.floor(this.elapsed);
    if (((check % Math.floor(60 / (GAME_CONFIG.enemy.autoSpawnSpeed + (0.1 * (level - 1))))) === 0)
      && (check !== this.lastEnemySpawn)) {
      this.lastEnemySpawn = check;
      this.spawn(level);
    }
  }

  hit(shots: GameSprite[]): number {
    let result = 0;
    shots.forEach(shot => {
      const enemy = this.enemies.find(enemy => !enemy.destroyed && shot.hit(enemy));
      if (enemy) {
        // explode
        const explosionSpritesheet = this.app.loader.resources['assets/explosion.json'].spritesheet !;
        const explosion = new AnimatedSprite(explosionSpritesheet.animations['explosion']);
        explosion.animationSpeed = 0.167;
        explosion.loop = false;
        explosion.x = enemy.x;
        explosion.y = enemy.y;
        explosion.onComplete = () => {
          // todo: reenable
          // this.collectables.spawn(explosion.x, explosion.y);
          explosion.destroy();
        };
        this.app.stage.addChild(explosion);
        enemy.destroy();
        shot.destroy();
        explosion.play();
        result++;
      }
    });

    return result;
    // this.shots = this.shots.filter(shot => !shot.destroyed);

  }

  kill(ship: GameSprite): boolean {
    if (!ship || ship.destroyed) {
      return false;
    }

    const enemy = this.enemies.find(enemy => !enemy.destroyed && ship.hit(enemy));
    if (enemy) {
      const explosionSpritesheet = this.app.loader.resources['assets/explosion.json'].spritesheet !;
      const explosion = new AnimatedSprite(explosionSpritesheet.animations['explosion']);
      explosion.animationSpeed = 0.167;
      explosion.loop = false;
      explosion.x = enemy.x;
      explosion.y = enemy.y;
      explosion.onComplete = () => {
        explosion.destroy();
      };
      this.app.stage.addChild(explosion);
      enemy.destroy();
      explosion.play();
      return true;
    }
    return false;
  }

  private spawn(level: number): void {
    const position = Math.floor(Math.random() * this.app.screen.width - 20) + 10;
    const enemySprite = this.app.loader.resources['assets/enemy.json'].spritesheet !;
    const enemy = new GameSprite(1 + (0.25 * (level)), enemySprite.animations['frame']);
    enemy.animationSpeed = 0.167;
    enemy.play();
    enemy.anchor.set(0.5);
    enemy.x = position;
    enemy.y = 10;
    this.#enemies.push(enemy);
    this.app.stage.addChild(enemy);
  }
}
