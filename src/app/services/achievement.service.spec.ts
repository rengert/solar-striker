import { TestBed } from '@angular/core/testing';
import { AchievementService } from './achievement.service';
import { StorageService } from './storage.service';
import { ACHIEVEMENTS } from '../models/achievement.model';

describe('AchievementService', () => {
  let service: AchievementService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    storageServiceSpy = jasmine.createSpyObj<StorageService>('StorageService', [
      'getAchievements',
      'setAchievements',
    ]);
    storageServiceSpy.getAchievements.and.returnValue(Promise.resolve([]));
    storageServiceSpy.setAchievements.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        AchievementService,
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    });

    service = TestBed.inject(AchievementService);
    await service.init();
  });

  it('should initialise all achievement states as not unlocked', () => {
    const states = service.getAll();
    expect(states.length).toBe(ACHIEVEMENTS.length);
    states.forEach((state) => {
      expect(state.unlocked).toBe(false);
      expect(state.progress).toBe(0);
    });
  });

  it('should unlock first_kill after addCumulative reaches threshold', () => {
    service.addCumulative('first_kill', 1);
    const states = service.getAll();
    const firstKill = states.find((s) => s.id === 'first_kill');
    expect(firstKill?.unlocked).toBe(true);
  });

  it('should NOT unlock sharp_shooter before threshold is reached', () => {
    // eslint-disable-next-line no-magic-numbers
    service.addCumulative('sharp_shooter', 99);
    const states = service.getAll();
    const sharpShooter = states.find((s) => s.id === 'sharp_shooter');
    expect(sharpShooter?.unlocked).toBe(false);
    // eslint-disable-next-line no-magic-numbers
    expect(sharpShooter?.progress).toBe(99);
  });

  it('should unlock sharp_shooter exactly at threshold', () => {
    // eslint-disable-next-line no-magic-numbers
    service.addCumulative('sharp_shooter', 100);
    const states = service.getAll();
    const sharpShooter = states.find((s) => s.id === 'sharp_shooter');
    expect(sharpShooter?.unlocked).toBe(true);
  });

  it('should NOT unlock again once already unlocked', () => {
    const unlockedSpy = jasmine.createSpy('onUnlocked');
    service.onUnlocked = unlockedSpy;

    service.addCumulative('first_kill', 1);
    service.addCumulative('first_kill', 1);

    expect(unlockedSpy).toHaveBeenCalledTimes(1);
  });

  it('should call onUnlocked callback with the correct achievement definition', () => {
    const unlockedSpy = jasmine.createSpy('onUnlocked');
    service.onUnlocked = unlockedSpy;

    service.addCumulative('first_kill', 1);

    const firstKillDef = ACHIEVEMENTS.find((a) => a.id === 'first_kill');
    expect(unlockedSpy).toHaveBeenCalledWith(firstKillDef);
  });

  it('should persist achievement state to storage on unlock', () => {
    service.addCumulative('first_kill', 1);
    expect(storageServiceSpy.setAchievements).toHaveBeenCalled();
  });

  it('should unlock combo_master when milestone reaches threshold', () => {
    // eslint-disable-next-line no-magic-numbers
    service.checkMilestone('combo_master', 5);
    const states = service.getAll();
    const comboMaster = states.find((s) => s.id === 'combo_master');
    expect(comboMaster?.unlocked).toBe(true);
  });

  it('should NOT unlock combo_master below threshold', () => {
    // eslint-disable-next-line no-magic-numbers
    service.checkMilestone('combo_master', 4);
    const states = service.getAll();
    const comboMaster = states.find((s) => s.id === 'combo_master');
    expect(comboMaster?.unlocked).toBe(false);
  });

  it('should return a definition for a known achievement id', () => {
    const def = service.getDefinition('veteran');
    expect(def).toBeDefined();
    expect(def?.id).toBe('veteran');
  });

  it('should return undefined for an unknown id', () => {
    const def = service.getDefinition('unknown' as never);
    expect(def).toBeUndefined();
  });

  it('should load saved achievement states from storage on init', async () => {
    storageServiceSpy.getAchievements.and.returnValue(
      Promise.resolve([{ id: 'first_kill', progress: 1, unlocked: true, unlockedAt: '2026-01-01T00:00:00.000Z' }]),
    );

    const newService = TestBed.inject(AchievementService);
    await newService.init();

    const states = newService.getAll();
    const firstKill = states.find((s) => s.id === 'first_kill');
    expect(firstKill?.unlocked).toBe(true);
  });
});
