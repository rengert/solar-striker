import { TestBed } from '@angular/core/testing';
import { Ticker } from 'pixi.js';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';
import { GameMeteorService } from './game-meteor.service';
import { ObjectService } from './object.service';

const STAGE_ONE = 1;
const STAGE_TEN = 10;
const DELTA_MS = 100;
const STAGE_ONE_ENERGY = 10;
const STAGE_TEN_ENERGY = 28;
const MAX_SPEED_MULTIPLIER = 3;
const METEOR_TEXTURE_RANDOM = 0.75;

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
    spyOn(Math, 'random').and.returnValue(METEOR_TEXTURE_RANDOM);

    (service as unknown as { spawn: (level: number) => void }).spawn(STAGE_ONE);
    (service as unknown as { spawn: (level: number) => void }).spawn(STAGE_TEN);

    const meteors = objectService.meteors();

    expect(meteors[0]!.energy).toBe(STAGE_ONE_ENERGY);
    expect(meteors[1]!.energy).toBe(STAGE_TEN_ENERGY);
  });

  it('should increase meteor movement speed gradually instead of spiking early', () => {
    spyOn(Math, 'random').and.returnValue(METEOR_TEXTURE_RANDOM);

    (service as unknown as { spawn: (level: number) => void }).spawn(STAGE_ONE);
    (service as unknown as { spawn: (level: number) => void }).spawn(STAGE_TEN);

    const meteors = objectService.meteors();
    const earlyMeteor = meteors[0]!;
    const lateMeteor = meteors[1]!;
    const earlyStartY = earlyMeteor.y;
    const lateStartY = lateMeteor.y;

    earlyMeteor.update(createTicker(DELTA_MS));
    lateMeteor.update(createTicker(DELTA_MS));

    const earlyDistance = earlyMeteor.y - earlyStartY;
    const lateDistance = lateMeteor.y - lateStartY;

    expect(lateDistance).toBeGreaterThan(earlyDistance);
    expect(lateDistance).toBeLessThan(earlyDistance * MAX_SPEED_MULTIPLIER);
  });
});
