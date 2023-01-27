import { AnimatedSprite, Application, Assets, Spritesheet } from 'pixi.js';
import { GameSprite } from '../models/pixijs/game-sprite';
import { PixiGameCollectableService } from './pixi-game-collectable.service';
import { GAME_CONFIG } from './pixi-game-constants';

export class PixiGameEnemyService {
  #enemies: GameSprite[] = [];

  private elapsed = 0;
  private lastEnemySpawn = -1;
  private explosionSprite!: Spritesheet;
  private enemySprite!: Spritesheet;

  constructor(
    private readonly app: Application,
    private readonly collectables: PixiGameCollectableService,
  ) {
  }

  get enemies(): GameSprite[] {
    return [...this.#enemies];
  }

  async init(): Promise<void> {
    this.explosionSprite = await Assets.load<Spritesheet>('assets/explosion.json');
    this.enemySprite = await Assets.load<Spritesheet>('assets/enemy.json');
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
    for (const shot of shots) {
      const enemy = this.enemies.find(enemy => !enemy.destroyed && shot.hit(enemy));
      if (enemy) {
        // explode
        const explosion = new AnimatedSprite(this.explosionSprite.animations['explosion']);
        explosion.animationSpeed = 0.167;
        explosion.loop = false;
        explosion.x = enemy.x;
        explosion.y = enemy.y;
        explosion.onComplete = () => {
          void this.collectables.spawn(explosion.x, explosion.y);
          explosion.destroy();
        };
        this.app.stage.addChild(explosion);
        enemy.destroy();
        shot.destroy();
        explosion.play();
        result++;
      }
    }

    return result;
  }

  kill(ship: GameSprite): boolean {
    if (!ship || ship.destroyed) {
      return false;
    }

    const enemy = this.enemies.find(enemy => !enemy.destroyed && ship.hit(enemy));
    if (enemy) {
      const explosion = new AnimatedSprite(this.explosionSprite.animations['explosion']);
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
    const enemy = new GameSprite(1 + (0.25 * (level)), this.enemySprite.animations['frame']);
    enemy.animationSpeed = 0.167;
    enemy.play();
    enemy.anchor.set(0.5);
    enemy.x = position;
    enemy.y = 10;
    this.#enemies.push(enemy);
    this.app.stage.addChild(enemy);
  }
}
