import { inject, Injectable } from '@angular/core';
import { AnimatedSprite, Assets, Spritesheet, Texture } from 'pixi.js';
import { ApplicationService } from './application.service';

@Injectable({ providedIn: 'root' })
export class ExplosionService {
  private explosionSprite: Spritesheet | undefined;

  private readonly application = inject(ApplicationService);

  private async getAnimationSprite(): Promise<AnimatedSprite> {
    if (!this.explosionSprite) {
      this.explosionSprite = await Assets.load<Spritesheet>('assets/game/explosion.json');
    }
    const animations: Record<string, Texture[]> = this.explosionSprite.animations;
    return new AnimatedSprite(animations['explosion']);
  }

  async explode(
    x: number,
    y: number,
    oncomplete: (explosion: AnimatedSprite) => void = (): void => {
    }): Promise<void> {
    // explode
    const explosion = await this.getAnimationSprite();
    explosion.animationSpeed = Math.min(.3, Math.max(0.1, Math.random()));
    explosion.loop = false;
    explosion.x = x;
    explosion.y = y;
    explosion.rotation = Math.random() * 360;
    explosion.onComplete = (): void => {
      oncomplete(explosion);
      explosion.destroy();
    };
    this.application.stage.addChild(explosion);
    explosion.play();
  }
}
