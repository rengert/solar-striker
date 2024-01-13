import { Injectable } from '@angular/core';
import { AnimatedSprite, Assets, Container, Spritesheet, Texture } from 'pixi.js';

@Injectable({ providedIn: 'root' })
export class ExplosionService {
  private explosionSprite: Spritesheet | undefined;

  private async getAnimationSprite(): Promise<AnimatedSprite> {
    if (!this.explosionSprite) {
      this.explosionSprite = await Assets.load<Spritesheet>('assets/game/explosion.json');
    }
    const animations: Record<string, Texture[]> = this.explosionSprite.animations;
    return new AnimatedSprite(animations['explosion']);
  }

  async explode(
    stage: Container,
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
    stage.addChild(explosion);
    explosion.play();
  }
}
