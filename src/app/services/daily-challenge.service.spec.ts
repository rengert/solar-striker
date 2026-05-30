import { TestBed } from '@angular/core/testing';
import { DAILY_CHALLENGE_POOL, getDailyChallenges, getDayIndex, getTodayDateKey } from '../models/daily-challenge.model';
import { StorageService } from './storage.service';
import { DailyChallengeEntry, DailyChallengeService } from './daily-challenge.service';

const EXPECTED_CHALLENGES_PER_DAY = 3;
const SAMPLE_DAY_INDEX = 42;
const SAMPLE_INITIAL_PROGRESS = 10;
// Fixed local date (year=2026, month=May(4), day=25, hour=12) for timezone-agnostic date key test
const SAMPLE_DATE_YEAR = 2026;
const SAMPLE_DATE_MONTH = 4;
const SAMPLE_DATE_DAY = 25;
const SAMPLE_DATE_HOUR = 12;

function getAnyCumulativeChallenge(entries: DailyChallengeEntry[]): DailyChallengeEntry | undefined {
  return entries.find((entry) => entry.def.type === 'kills' || entry.def.type === 'coins' || entry.def.type === 'boss');
}

function addCumulativeProgress(service: DailyChallengeService, entry: DailyChallengeEntry, amount: number): void {
  switch (entry.def.type) {
    case 'kills':
      service.addKills(amount);
      break;
    case 'coins':
      service.addCoins(amount);
      break;
    case 'boss':
      for (let i = 0; i < amount; i++) {
        service.addBoss();
      }
      break;
    default:
      fail(`Unsupported cumulative challenge type: ${entry.def.type}`);
  }
}

function getAnyMaxChallenge(entries: DailyChallengeEntry[]): DailyChallengeEntry | undefined {
  return entries.find((entry) => entry.def.type === 'combo' || entry.def.type === 'level');
}

function updateMaxProgress(service: DailyChallengeService, entry: DailyChallengeEntry, value: number): void {
  switch (entry.def.type) {
    case 'combo':
      service.checkCombo(value);
      break;
    case 'level':
      service.checkLevel(value);
      break;
    default:
      fail(`Unsupported max challenge type: ${entry.def.type}`);
  }
}

function getAnyUniqueTypeChallenge(entries: DailyChallengeEntry[]): DailyChallengeEntry | undefined {
  return entries.find((entry) => entries.filter((candidate) => candidate.def.type === entry.def.type).length === 1);
}

function advanceChallengeToThreshold(service: DailyChallengeService, entry: DailyChallengeEntry): void {
  if (entry.def.type === 'kills' || entry.def.type === 'coins' || entry.def.type === 'boss') {
    addCumulativeProgress(service, entry, entry.def.threshold);
    return;
  }
  updateMaxProgress(service, entry, entry.def.threshold);
}

describe('daily-challenge model helpers', () => {
  it('getTodayDateKey returns a YYYY-MM-DD string', () => {
    const key = getTodayDateKey(new Date(SAMPLE_DATE_YEAR, SAMPLE_DATE_MONTH, SAMPLE_DATE_DAY, SAMPLE_DATE_HOUR, 0, 0));
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

  it('getDailyChallenges provides 12 unique daily sets before repeating', () => {
    const uniqueSets = new Set<string>();
    for (let i = 0; i < DAILY_CHALLENGE_POOL.length; i++) {
      const normalizedSet = getDailyChallenges(i)
        .map((challenge) => challenge.id)
        .sort()
        .join(',');
      uniqueSets.add(normalizedSet);
    }
    expect(uniqueSets.size).toBe(DAILY_CHALLENGE_POOL.length);
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

  it('should increment cumulative-type challenge progress', () => {
    const cumulativeEntry = getAnyCumulativeChallenge(service.getToday());
    if (!cumulativeEntry) {
      fail('Expected at least one cumulative challenge in today selection');
      return;
    }
    const progressToAdd = 2;
    addCumulativeProgress(service, cumulativeEntry, progressToAdd);
    const updated = service.getToday().find((e) => e.def.id === cumulativeEntry.def.id);
    expect(updated?.progress).toBe(progressToAdd);
  });

  it('should track highest max-type progress (not accumulate)', () => {
    const maxEntry = getAnyMaxChallenge(service.getToday());
    if (!maxEntry) {
      fail('Expected at least one max challenge in today selection');
      return;
    }
    const lowValue = 2;
    const highValue = 4;
    const midValue = 3;
    updateMaxProgress(service, maxEntry, lowValue);
    updateMaxProgress(service, maxEntry, highValue);
    updateMaxProgress(service, maxEntry, midValue);
    const updated = service.getToday().find((e) => e.def.id === maxEntry.def.id);
    expect(updated?.progress).toBe(highValue);
  });

  it('should mark challenge as completed when threshold is reached', () => {
    const uniqueTypeEntry = getAnyUniqueTypeChallenge(service.getToday());
    if (!uniqueTypeEntry) {
      fail('Expected at least one unique-type challenge in today selection');
      return;
    }
    advanceChallengeToThreshold(service, uniqueTypeEntry);
    const updated = service.getToday().find((e) => e.def.id === uniqueTypeEntry.def.id);
    expect(updated?.completed).toBe(true);
  });

  it('should call onCompleted callback when threshold is reached', () => {
    const completedSpy = jasmine.createSpy('onCompleted');
    service.onCompleted = completedSpy;

    const uniqueTypeEntry = getAnyUniqueTypeChallenge(service.getToday());
    if (!uniqueTypeEntry) {
      fail('Expected at least one unique-type challenge in today selection');
      return;
    }
    advanceChallengeToThreshold(service, uniqueTypeEntry);
    expect(completedSpy).toHaveBeenCalledTimes(1);
    expect(completedSpy).toHaveBeenCalledWith(uniqueTypeEntry.def);
  });

  it('should NOT call onCompleted twice for the same challenge', () => {
    const completedSpy = jasmine.createSpy('onCompleted');
    service.onCompleted = completedSpy;

    const uniqueTypeEntry = getAnyUniqueTypeChallenge(service.getToday());
    if (!uniqueTypeEntry) {
      fail('Expected at least one unique-type challenge in today selection');
      return;
    }
    advanceChallengeToThreshold(service, uniqueTypeEntry);
    advanceChallengeToThreshold(service, uniqueTypeEntry);
    expect(completedSpy).toHaveBeenCalledTimes(1);
  });

  it('should persist state to storage when progress changes', () => {
    const cumulativeEntry = getAnyCumulativeChallenge(service.getToday());
    if (!cumulativeEntry) {
      fail('Expected at least one cumulative challenge in today selection');
      return;
    }
    addCumulativeProgress(service, cumulativeEntry, 1);
    expect(storageServiceSpy.setDailyChallenges).toHaveBeenCalled();
  });

  it('should load saved state from storage when date matches today', async () => {
    const today = getTodayDateKey();
    const cumulativeEntry = getAnyCumulativeChallenge(service.getToday());
    if (!cumulativeEntry) {
      fail('Expected at least one cumulative challenge in today selection');
      return;
    }
    storageServiceSpy.getDailyChallenges.and.returnValue(
      Promise.resolve({
        date: today,
        progress: { [cumulativeEntry.def.id]: SAMPLE_INITIAL_PROGRESS },
        completed: {},
      }),
    );

    const freshService = TestBed.inject(DailyChallengeService);
    await freshService.init();

    const entry = freshService.getToday().find((e) => e.def.id === cumulativeEntry.def.id);
    expect(entry?.progress).toBe(SAMPLE_INITIAL_PROGRESS);
  });

  it('should reset state when stored date is from a different day', async () => {
    const staleId = DAILY_CHALLENGE_POOL[0].id;
    const staleProgress = 999;
    storageServiceSpy.getDailyChallenges.and.returnValue(
      Promise.resolve({
        // fixed old date to ensure stored state is stale
        date: '1970-01-02',
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
