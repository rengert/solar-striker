import { TestBed } from '@angular/core/testing';
import { Ticker } from 'pixi.js';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';
import { GameMeteorService } from './game-meteor.service';
import { ObjectModelType, ObjectService } from './object.service';

const STAGE_ONE = 1;
const STAGE_TEN = 10;
const DELTA_MS = 100;
const STAGE_ONE_ENERGY = 10;
const STAGE_TEN_ENERGY = 28;
const MAX_SPEED_MULTIPLIER = 3;
const METEOR_TEXTURE_RANDOM = 0.75;
// Math.random() = 0 → no size addition → base width (~28 px) stays below the split threshold
const METEOR_SMALL_RANDOM = 0;
// Expected meteor counts after a split: 1 original + 2–4 fragments
const MIN_METEORS_AFTER_SPLIT = 3;
const MAX_METEORS_AFTER_SPLIT = 5;

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

  describe('meteor splitting', () => {
    it('should split a large meteor into 2–4 fragments', () => {
      // METEOR_TEXTURE_RANDOM (0.75) → width += 0.75*20 = 15 → width ≈ 43 > split threshold
      spyOn(Math, 'random').and.returnValue(METEOR_TEXTURE_RANDOM);

      (service as unknown as { spawn: (level: number) => void }).spawn(STAGE_ONE);

      const meteors = objectService.meteors();
      expect(meteors.length).toBe(1);

      const largeMeteor = meteors[0]!;
      largeMeteor.destroying = true;
      objectService.triggerCallbacks(largeMeteor, {} as ObjectModelType);

      expect(service.splitMeteors.has(largeMeteor)).toBeTrue();
      // Original meteor + 2–4 fragments
      const allMeteors = objectService.meteors();
      expect(allMeteors.length).toBeGreaterThanOrEqual(MIN_METEORS_AFTER_SPLIT);
      expect(allMeteors.length).toBeLessThanOrEqual(MAX_METEORS_AFTER_SPLIT);
    });

    it('should not split a small meteor', () => {
      // METEOR_SMALL_RANDOM (0) → width += 0 → width ≈ 28 < split threshold
      spyOn(Math, 'random').and.returnValue(METEOR_SMALL_RANDOM);

      (service as unknown as { spawn: (level: number) => void }).spawn(STAGE_ONE);

      const meteors = objectService.meteors();
      expect(meteors.length).toBe(1);

      const smallMeteor = meteors[0]!;
      smallMeteor.destroying = true;
      objectService.triggerCallbacks(smallMeteor, {} as ObjectModelType);

      expect(service.splitMeteors.has(smallMeteor)).toBeFalse();
      // No fragments added
      expect(objectService.meteors().length).toBe(1);
    });

    it('should distribute energy proportionally across fragments', () => {
      spyOn(Math, 'random').and.returnValue(METEOR_TEXTURE_RANDOM);

      (service as unknown as { spawn: (level: number) => void }).spawn(STAGE_ONE);

      const largeMeteor = objectService.meteors()[0]!;
      const originalEnergy = largeMeteor.initialEnergy ?? 0;
      largeMeteor.destroying = true;
      objectService.triggerCallbacks(largeMeteor, {} as ObjectModelType);

      const fragments = objectService.meteors().filter((m) => m !== largeMeteor);
      const totalFragmentEnergy = fragments.reduce((sum, f) => sum + (f.energy ?? 0), 0);

      // Total energy across fragments must be at least as much as the original
      expect(totalFragmentEnergy).toBeGreaterThanOrEqual(originalEnergy);
    });
  });
});
