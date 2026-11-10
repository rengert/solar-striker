/* eslint-disable no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { Sprite, Ticker } from 'pixi.js';
import { ApplicationService } from './application.service';
import { ParticleService } from './particle.service';

describe('ParticleService', () => {
  let service: ParticleService;
  let tick: (ticker: Ticker) => void;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ParticleService,
        {
          provide: ApplicationService,
          useValue: {
            ticker: {
              add: (fn: (ticker: Ticker) => void, context: unknown): void => {
                tick = fn.bind(context);
              },
            },
          },
        },
      ],
    });
    service = TestBed.inject(ParticleService);
  });

  it('should reuse a finished sprite with a fresh alpha instead of creating a new one', () => {
    service.emit({ x: 0, y: 0, color: 0xffffff, life: 100 });
    const sprite = service.layer.children[0] as Sprite;
    tick({ deltaMS: 200 } as Ticker);
    expect(sprite.visible).toBeFalse();

    service.emit({ x: 5, y: 5, color: 0xff0000, alpha: 0.8 });

    expect(service.layer.children.length).toBe(1);
    expect(sprite.visible).toBeTrue();
    expect(sprite.alpha).toBe(0.8);
    expect(sprite.x).toBe(5);
  });
});
