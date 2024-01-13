import { inject } from '@angular/core';
import { AnimatedSprite } from 'pixi.js';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';

export abstract class BaseService {
  private explosion = inject(ExplosionService);

  protected readonly application = inject(ApplicationService);

  protected explode(
    x: number,
    y: number,
    oncomplete: (explosion: AnimatedSprite) => void = (): void => {
    },
  ): void {
    void this.explosion.explode(this.application.stage, x, y, oncomplete);
  }
}
