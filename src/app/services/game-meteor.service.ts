import { AnimatedSprite, Application, Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { GameSprite } from '../models/pixijs/simple-game-sprite';

export class GameMeteorService {
  #meteors: GameSprite[] = [];

  private elapsed = 0;
  private lastMeteorSpawn = -1;
  private explosionSprite!: Spritesheet;

  constructor(private readonly app: Application) {
  }

  get meteors(): GameSprite[] {
    return [...this.#meteors];
  }

  async init(): Promise<void> {
    this.explosionSprite = await Assets.load<Spritesheet>('assets/game/explosion.json');
  }

  update(delta: number, level: number): void {
    this.elapsed += delta;

    this.#meteors.forEach(enemy => enemy.update(delta));

    this.#meteors = this.#meteors.filter(enemy => !enemy.destroyed);
    this.#meteors
      .filter(enemy => enemy.y > this.app.screen.height + 50)
      .forEach(enemy => {
        enemy.y = 0;
      });

    const check = Math.floor(this.elapsed);
    if (((check % Math.floor(60 / (GAME_CONFIG.enemy.autoSpawnSpeed + (0.1 * (level - 1))))) === 0)
      && (check !== this.lastMeteorSpawn)) {
      this.lastMeteorSpawn = check;
      this.spawn(level);
    }
  }

  hit(shots: AnimatedGameSprite[]): number {
    for (const shot of shots) {
      const hit = this.meteors.find(enemy => !enemy.destroyed && shot.hit(enemy));
      if (hit) {
        // explode
        const animations: Record<string, Texture[]> = this.explosionSprite.animations;
        const explosion = new AnimatedSprite(animations['explosion']);
        explosion.animationSpeed = 0.167;
        explosion.loop = false;
        explosion.x = hit.x;
        explosion.y = hit.y;
        explosion.onComplete = (): void => explosion.destroy();
        this.app.stage.addChild(explosion);
        shot.destroy();
        explosion.play();
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
      const animations: Record<string, Texture[]> = this.explosionSprite.animations;
      const explosion = new AnimatedSprite(animations['explosion']);
      explosion.animationSpeed = 0.167;
      explosion.loop = false;
      explosion.x = hit.x;
      explosion.y = hit.y;
      explosion.onComplete = (): void => explosion.destroy();
      this.app.stage.addChild(explosion);
      explosion.play();
      return true;
    }
    return false;
  }

  private spawn(level: number): void {
    const position = Math.floor(Math.random() * this.app.screen.width - 20) + 10;
    const meteor = new GameSprite(1 + (0.25 * (level)), Texture.from('assets/game/meteors/meteorBrown_small1.png'));
    meteor.anchor.set(0.5);
    meteor.x = position;
    meteor.y = 10;
    this.#meteors.push(meteor);
    this.app.stage.addChild(meteor);
  }
}
