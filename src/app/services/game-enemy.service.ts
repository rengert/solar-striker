import { AnimatedSprite, Application, Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { GameSprite } from '../models/pixijs/simple-game-sprite';
import { GameCollectableService } from './game-collectable.service';

export class GameEnemyService {
  #enemies: AnimatedGameSprite[] = [];

  private elapsed = 0;
  private lastEnemySpawn = -1;
  private explosionSprite!: Spritesheet;
  private enemySprite!: Spritesheet;

  constructor(
    private readonly app: Application,
    private readonly collectables: GameCollectableService,
  ) {
  }

  get enemies(): AnimatedGameSprite[] {
    return [...this.#enemies];
  }

  async init(): Promise<void> {
    this.explosionSprite = await Assets.load<Spritesheet>('assets/game/explosion.json');
    this.enemySprite = await Assets.load<Spritesheet>('assets/game/enemy.json');
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

  hit(shots: AnimatedGameSprite[] | GameSprite[], destroyOnHit = true, spawnCollectable = true): number {
    let result = 0;
    for (const shot of shots.filter(s => !s.destroyed)) {
      const hitEnemy = this.enemies.find(enemy => !enemy.destroyed && shot.hit(enemy));
      if (hitEnemy) {
        // explode
        const animations: Record<string, Texture[]> = this.explosionSprite.animations;
        const explosion = new AnimatedSprite(animations['explosion']);
        explosion.animationSpeed = 0.167;
        explosion.loop = false;
        explosion.x = hitEnemy.x;
        explosion.y = hitEnemy.y;
        explosion.onComplete = (): void => {
          if (spawnCollectable) {
            this.collectables.spawn(explosion.x, explosion.y);
          }

          explosion.destroy();
        };
        this.app.stage.addChild(explosion);
        hitEnemy.destroy();
        if (destroyOnHit) {
          shot.destroy();
        }
        explosion.play();
        result++;
      }
    }

    return result;
  }

  kill(ship: AnimatedGameSprite | undefined): boolean {
    if (!ship || ship.destroyed) {
      return false;
    }

    const hitEnemy = this.enemies.find(enemy => !enemy.destroyed && ship.hit(enemy));
    if (hitEnemy) {
      const animations: Record<string, Texture[]> = this.explosionSprite.animations;
      const explosion = new AnimatedSprite(animations['explosion']);
      explosion.animationSpeed = 0.167;
      explosion.loop = false;
      explosion.x = hitEnemy.x;
      explosion.y = hitEnemy.y;
      explosion.onComplete = (): void => {
        explosion.destroy();
      };
      this.app.stage.addChild(explosion);
      hitEnemy.destroy();
      explosion.play();
      return true;
    }
    return false;
  }

  private spawn(level: number): void {
    const position = Math.floor(Math.random() * this.app.screen.width - 20) + 10;
    const animations: Record<string, Texture[]> = this.enemySprite.animations;
    const enemy = new AnimatedGameSprite(1 + (0.25 * (level)), animations['frame']);
    enemy.animationSpeed = 0.167;
    enemy.play();
    enemy.anchor.set(0.5);
    enemy.x = position;
    enemy.y = 10;
    this.#enemies.push(enemy);
    this.app.stage.addChild(enemy);
  }
}
