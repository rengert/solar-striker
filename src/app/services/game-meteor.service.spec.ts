import { TestBed } from '@angular/core/testing';
import { Ticker } from 'pixi.js';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';
import { GameMeteorService } from './game-meteor.service';
import { ObjectService } from './object.service';

function createTicker(deltaMS: number): Ticker {
  return { deltaMS } as Ticker;
}

describe('GameMeteorService', () => {
  let service: GameMeteorService;
  let objectService: ObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameMeteorService,
        ObjectService,
        {
          provide: ApplicationService,
          useValue: {
            stage: { addChild: jasmine.createSpy('addChild') },
            screen: { width: 400, height: 600 },
          },
        },
        {
          provide: ExplosionService,
          useValue: {
            explode: jasmine.createSpy('explode').and.returnValue(Promise.resolve()),
          },
        },
      ],
    });

    service = TestBed.inject(GameMeteorService);
    objectService = TestBed.inject(ObjectService);
  });

  it('should scale meteor energy more gently across levels', () => {
    spyOn(Math, 'random').and.returnValue(1);

    (service as unknown as { spawn: (level: number) => void }).spawn(1);
    (service as unknown as { spawn: (level: number) => void }).spawn(10);

    const meteors = objectService.meteors();

    expect(meteors[0].energy).toBe(10);
    expect(meteors[1].energy).toBe(28);
  });

  it('should increase meteor movement speed gradually instead of spiking early', () => {
    spyOn(Math, 'random').and.returnValue(1);

    (service as unknown as { spawn: (level: number) => void }).spawn(1);
    (service as unknown as { spawn: (level: number) => void }).spawn(10);

    const [earlyMeteor, lateMeteor] = objectService.meteors();
    const earlyStartY = earlyMeteor.y;
    const lateStartY = lateMeteor.y;

    earlyMeteor.update(createTicker(100));
    lateMeteor.update(createTicker(100));

    const earlyDistance = earlyMeteor.y - earlyStartY;
    const lateDistance = lateMeteor.y - lateStartY;

    expect(lateDistance).toBeGreaterThan(earlyDistance);
    expect(lateDistance).toBeLessThan(earlyDistance * 3);
  });
});
