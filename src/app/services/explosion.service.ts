import { inject, Injectable } from '@angular/core';
import { AnimatedSprite, Assets, Spritesheet, Texture } from 'pixi.js';
import { CURRENT_SEASON_EVENT } from '../models/season-event.model';
import { ApplicationService } from './application.service';
import { ParticleService } from './particle.service';
import { SoundService } from './sound.service';

@Injectable()
export class ExplosionService {
  private explosionSprite: Spritesheet | undefined;

  private readonly application = inject(ApplicationService);
  private readonly particles = inject(ParticleService);
  private readonly sound = inject(SoundService);

  async explode(
    x: number,
    y: number,
    scale = 1,
    oncomplete: (explosion: AnimatedSprite) => void = (): void => {},
  ): Promise<void> {
    this.spawnBurst(x, y, scale);
    this.sound.play(scale > 1 ? 'bigExplosion' : 'explosion');
    // explode
    const explosion = await this.getAnimationSprite();
    // eslint-disable-next-line no-magic-numbers
    explosion.animationSpeed = Math.min(0.3, Math.max(0.1, Math.random()));
    explosion.loop = false;
    explosion.x = x;
    explosion.y = y;
    explosion.scale.set(scale);
    // eslint-disable-next-line no-magic-numbers
    explosion.rotation = Math.random() * 360;
    explosion.onComplete = (): void => {
      oncomplete(explosion);
      explosion.destroy();
    };
    this.application.stage.addChild(explosion);
    explosion.play();
  }

  /* eslint-disable no-magic-numbers */
  private spawnBurst(x: number, y: number, scale: number): void {
    // flash
    this.particles.emit({ x, y, color: 0xffcc66, life: 300, scale: 1.5 * scale, endScale: 3 * scale });
    // shockwave
    this.particles.emit({ x, y, color: 0xffaa55, ring: true, life: 500, scale: 0.2 * scale, endScale: 2 * scale });
    // sparks, in seasonal colors during events
    const colors = CURRENT_SEASON_EVENT?.colors;
    this.particles.emit({
      x, y, color: colors ? colors[Math.floor(Math.random() * colors.length)] : 0xffdd88, count: Math.round(14 * scale), speed: 0.35, life: 700, scale: 0.4, endScale: 0.05, drag: 0.94,
    });
    // smoke
    this.particles.emit({
      x, y, color: 0x3a2a22, count: Math.round(3 * scale), speed: 0.03, life: 900,
      scale: 0.6 * scale, endScale: 1.8 * scale, alpha: 0.45, additive: false,
    });
  }
  /* eslint-enable no-magic-numbers */

  private async getAnimationSprite(): Promise<AnimatedSprite> {
    if (!this.explosionSprite) {
      this.explosionSprite = await Assets.load<Spritesheet>('assets/game/explosion.json');
    }
    const animations: Record<string, Texture[]> = this.explosionSprite.animations;
    return new AnimatedSprite(animations['explosion']);
  }
}
