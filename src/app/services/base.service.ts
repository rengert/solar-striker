import { AnimatedSprite, Application, Assets, Spritesheet, Texture } from 'pixi.js';

export abstract class BaseService {
  private explosionSprite!: Spritesheet;

  protected constructor(protected readonly app: Application) {
  }

  protected async init(): Promise<void> {
    this.explosionSprite = await Assets.load<Spritesheet>('assets/game/explosion.json');
  }

  protected explode(
    x: number,
    y: number,
    oncomplete: (explosion: AnimatedSprite) => void = (): void => {
    },
  ): void {
    // explode
    const animations: Record<string, Texture[]> = this.explosionSprite.animations;
    const explosion = new AnimatedSprite(animations['explosion']);
    explosion.animationSpeed = Math.min(.3, Math.max(0.1, Math.random()));
    explosion.loop = false;
    explosion.x = x;
    explosion.y = y;
    explosion.rotation = Math.random() * 360;
    explosion.onComplete = (): void => {
      oncomplete(explosion);
      explosion.destroy();
    };
    this.app.stage.addChild(explosion);
    explosion.play();
  }
}
