import { TestBed } from '@angular/core/testing';
import { DAILY_CHALLENGE_POOL, getDailyChallenges, getDayIndex, getTodayDateKey } from '../models/daily-challenge.model';
import { StorageService } from './storage.service';
import { DailyChallengeService } from './daily-challenge.service';

const EXPECTED_CHALLENGES_PER_DAY = 3;
const SAMPLE_DAY_INDEX = 42;
const SAMPLE_INITIAL_PROGRESS = 10;

describe('daily-challenge model helpers', () => {
  it('getTodayDateKey returns a YYYY-MM-DD string', () => {
    const key = getTodayDateKey(new Date('2026-05-25T12:00:00Z'));
    expect(key).toBe('2026-05-25');
  });

  it('getDayIndex returns a positive integer', () => {
    const index = getDayIndex('2026-05-25');
    expect(index).toBeGreaterThan(0);
    expect(Number.isInteger(index)).toBe(true);
  });

  it('getDailyChallenges returns exactly 3 challenges', () => {
    const challenges = getDailyChallenges(0);
    expect(challenges.length).toBe(EXPECTED_CHALLENGES_PER_DAY);
  });

  it('getDailyChallenges returns distinct challenges for a given day', () => {
    const challenges = getDailyChallenges(SAMPLE_DAY_INDEX);
    const ids = new Set(challenges.map((c) => c.id));
    expect(ids.size).toBe(EXPECTED_CHALLENGES_PER_DAY);
  });
});

describe('DailyChallengeService', () => {
  let service: DailyChallengeService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    storageServiceSpy = jasmine.createSpyObj<StorageService>('StorageService', [
      'getDailyChallenges',
      'setDailyChallenges',
    ]);
    storageServiceSpy.getDailyChallenges.and.returnValue(Promise.resolve(null));
    storageServiceSpy.setDailyChallenges.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        DailyChallengeService,
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    });

    service = TestBed.inject(DailyChallengeService);
    await service.init();
  });

  it('should initialise with 3 challenges for today', () => {
    const entries = service.getToday();
    expect(entries.length).toBe(EXPECTED_CHALLENGES_PER_DAY);
  });

  it('should start all challenges as not completed with zero progress', () => {
    service.getToday().forEach((entry) => {
      expect(entry.completed).toBe(false);
      expect(entry.progress).toBe(0);
    });
  });

  it('should increment kills-type challenge progress', () => {
    const killsEntry = service.getToday().find((e) => e.def.type === 'kills');
    if (!killsEntry) {
      pending('No kills challenge today');
      return;
    }
    const killsToAdd = 5;
    service.addKills(killsToAdd);
    const updated = service.getToday().find((e) => e.def.id === killsEntry.def.id);
    expect(updated?.progress).toBe(killsToAdd);
  });

  it('should track highest combo (not accumulate)', () => {
    const comboEntry = service.getToday().find((e) => e.def.type === 'combo');
    if (!comboEntry) {
      pending('No combo challenge today');
      return;
    }
    const lowCombo = 2;
    const highCombo = 4;
    const midCombo = 3;
    service.checkCombo(lowCombo);
    service.checkCombo(highCombo);
    service.checkCombo(midCombo);
    const updated = service.getToday().find((e) => e.def.id === comboEntry.def.id);
    expect(updated?.progress).toBe(highCombo);
  });

  it('should mark challenge as completed when threshold is reached', () => {
    const killsEntry = service.getToday().find((e) => e.def.type === 'kills');
    if (!killsEntry) {
      pending('No kills challenge today');
      return;
    }
    service.addKills(killsEntry.def.threshold);
    const updated = service.getToday().find((e) => e.def.id === killsEntry.def.id);
    expect(updated?.completed).toBe(true);
  });

  it('should call onCompleted callback when threshold is reached', () => {
    const completedSpy = jasmine.createSpy('onCompleted');
    service.onCompleted = completedSpy;

    const killsEntry = service.getToday().find((e) => e.def.type === 'kills');
    if (!killsEntry) {
      pending('No kills challenge today');
      return;
    }
    service.addKills(killsEntry.def.threshold);
    expect(completedSpy).toHaveBeenCalledTimes(1);
    expect(completedSpy).toHaveBeenCalledWith(killsEntry.def);
  });

  it('should NOT call onCompleted twice for the same challenge', () => {
    const completedSpy = jasmine.createSpy('onCompleted');
    service.onCompleted = completedSpy;

    const killsEntry = service.getToday().find((e) => e.def.type === 'kills');
    if (!killsEntry) {
      pending('No kills challenge today');
      return;
    }
    service.addKills(killsEntry.def.threshold);
    service.addKills(killsEntry.def.threshold);
    expect(completedSpy).toHaveBeenCalledTimes(1);
  });

  it('should persist state to storage when progress changes', () => {
    const killsEntry = service.getToday().find((e) => e.def.type === 'kills');
    if (!killsEntry) {
      pending('No kills challenge today');
      return;
    }
    service.addKills(1);
    expect(storageServiceSpy.setDailyChallenges).toHaveBeenCalled();
  });

  it('should load saved state from storage when date matches today', async () => {
    const today = getTodayDateKey();
    const killsEntry = service.getToday().find((e) => e.def.type === 'kills');
    if (!killsEntry) {
      pending('No kills challenge today');
      return;
    }
    storageServiceSpy.getDailyChallenges.and.returnValue(
      Promise.resolve({
        date: today,
        progress: { [killsEntry.def.id]: SAMPLE_INITIAL_PROGRESS },
        completed: {},
      }),
    );

    const freshService = TestBed.inject(DailyChallengeService);
    await freshService.init();

    const entry = freshService.getToday().find((e) => e.def.id === killsEntry.def.id);
    expect(entry?.progress).toBe(SAMPLE_INITIAL_PROGRESS);
  });

  it('should reset state when stored date is from a different day', async () => {
    const staleId = DAILY_CHALLENGE_POOL[0].id;
    const staleProgress = 999;
    storageServiceSpy.getDailyChallenges.and.returnValue(
      Promise.resolve({
        date: '1970-01-01',
        progress: { [staleId]: staleProgress },
        completed: { [staleId]: true },
      }),
    );

    const freshService = TestBed.inject(DailyChallengeService);
    await freshService.init();

    freshService.getToday().forEach((entry) => {
      expect(entry.progress).toBe(0);
      expect(entry.completed).toBe(false);
    });
  });
});
