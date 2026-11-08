import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ObjectModelType, ObjectService } from './object.service';
import { ApplicationService } from './application.service';
import { GameService } from './game.service';
import { SoundService } from './sound.service';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { AppScreen } from '../models/pixijs/app-screen';
import { GameCollectableService } from './game-collectable.service';
import { EnemyKind, GameEnemyService } from './game-enemy.service';
import { GameLandscapeService } from './game-landscape.service';
import { GameMeteorService } from './game-meteor.service';
import { BASE_MAX_ENERGY, GameBaseService } from './game-base.service';
import { GameScreenService } from './game-screen.service';
import { GameShipService } from './game-ship.service';
import { GameShotService } from './game-shot.service';
import { PlayerShipService } from './player-ship.service';
import { ShipUpgradeService } from './ship-upgrade.service';
import { StorageService } from './storage.service';
import { TranslationService } from './translation.service';
import { AchievementService } from './achievement.service';
import { DailyChallengeService } from './daily-challenge.service';
import { GAME_CONFIG, MAX_STAGE } from '../game-constants';
import { DEFAULT_PLAYER_SHIP_CLASS, PLAYER_SHIP_DEFINITIONS } from '../models/player-ship-class.model';
import { PausePopup } from '../popups/pause-popup';
import { getBossDebriefing, getStageBriefing } from '../models/story.model';

const STAGE_TWO = 2;
const STAGE_THREE = 3;
const COMBO_REWARD_AT_MAX = 5;
const BOSS_COMBO_MULTIPLIER = 2;
const BASE_STAGE_KILL_TARGET = 24;
const STAGE_KILL_PLATEAU_END = 10;
const STAGE_KILL_GROWTH_TRIGGER = 11;
const STAGE_KILL_GROWN_TARGET = 26;
const SAVED_STAGE_SEVEN = 7;

function createMockObject(
  type: ObjectType,
  overrides: Record<string, unknown> = {},
): ObjectModelType {
  return {
    type,
    destroying: false,
    destroyed: false,
    reference: undefined,
    energy: 1,
    power: 1,
    ...overrides,
  } as unknown as ObjectModelType;
}

describe('GameService', () => {
  let service: GameService;
  let objectService: ObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        ObjectService,
        {
          provide: ApplicationService,
          useValue: {
            stage: { addChild: jasmine.createSpy('addChild'), on: jasmine.createSpy('on') },
            ticker: {
              add: jasmine.createSpy('add'),
              remove: jasmine.createSpy('remove'),
              stop: jasmine.createSpy('stop'),
              start: jasmine.createSpy('start'),
            },
            screen: { width: 800, height: 600 },
          },
        },
        { provide: GameCollectableService, useValue: { update: jasmine.createSpy('update') } },
        { provide: GameEnemyService, useValue: { update: jasmine.createSpy('update'), bossFightActive: false, spawnStageBoss: jasmine.createSpy('spawnStageBoss'), getKind: (): undefined => undefined } },
        { provide: GameLandscapeService, useValue: { update: jasmine.createSpy('update'), setStage: jasmine.createSpy('setStage') } },
        {
          provide: GameBaseService,
          useValue: { energy: signal(BASE_MAX_ENERGY), init: jasmine.createSpy('init'), repair: jasmine.createSpy('repair'), attack: jasmine.createSpy('attack') },
        },
        { provide: GameMeteorService, useValue: { update: jasmine.createSpy('update'), splitMeteors: { has: (): boolean => false } } },
        {
          provide: GameScreenService,
          useValue: {
            coins: 0,
            kills: 0,
            level: 0,
            pauseButtonVisible: false,
            onPause: undefined,
            showStageAnnouncement: jasmine.createSpy('showStageAnnouncement'),
            showBossWarning: jasmine.createSpy('showBossWarning'),
            applyScreenShake: jasmine.createSpy('applyScreenShake'),
            flashScreen: jasmine.createSpy('flashScreen'),
            showFloatingText: jasmine.createSpy('showFloatingText'),
            showRadioMessages: jasmine.createSpy('showRadioMessages'),
            clearRadioMessages: jasmine.createSpy('clearRadioMessages'),
            update: jasmine.createSpy('update'),
          },
        },
        {
          provide: GameShipService,
          useValue: {
            instance: { autoFire: false, energy: 10, x: 100, y: 200 },
            applyUpgrades: jasmine.createSpy('applyUpgrades'),
            spawn: jasmine.createSpy('spawn'),
            update: jasmine.createSpy('update'),
          },
        },
        { provide: GameShotService, useValue: { update: jasmine.createSpy('update') } },
        { provide: SoundService, useValue: jasmine.createSpyObj('SoundService', ['play', 'startMusic', 'stopMusic']) },
        { provide: ShipUpgradeService, useValue: {} },
        {
          provide: PlayerShipService,
          useValue: {
            init: jasmine.createSpy('init').and.returnValue(Promise.resolve()),
            definitions: PLAYER_SHIP_DEFINITIONS,
            getSelectedClass: jasmine.createSpy('getSelectedClass').and.returnValue(DEFAULT_PLAYER_SHIP_CLASS),
            isUnlocked: jasmine.createSpy('isUnlocked').and.returnValue(true),
            getDefinition: jasmine.createSpy('getDefinition').and.returnValue(PLAYER_SHIP_DEFINITIONS[0]),
            getSelectedDefinition: jasmine.createSpy('getSelectedDefinition').and.returnValue(PLAYER_SHIP_DEFINITIONS[0]),
            selectClass: jasmine.createSpy('selectClass').and.returnValue(Promise.resolve()),
            unlock: jasmine.createSpy('unlock').and.returnValue(Promise.resolve()),
            applyToShip: jasmine.createSpy('applyToShip'),
          },
        },
        { provide: TranslationService, useValue: {} },
        {
          provide: AchievementService,
          useValue: {
            init: jasmine.createSpy('init').and.returnValue(Promise.resolve()),
            onUnlocked: undefined,
            checkMilestone: jasmine.createSpy('checkMilestone'),
            addCumulative: jasmine.createSpy('addCumulative'),
            getAll: jasmine.createSpy('getAll').and.returnValue([]),
          },
        },
        {
          provide: DailyChallengeService,
          useValue: {
            init: jasmine.createSpy('init').and.returnValue(Promise.resolve()),
            onCompleted: undefined,
            addKills: jasmine.createSpy('addKills'),
            checkCombo: jasmine.createSpy('checkCombo'),
            checkLevel: jasmine.createSpy('checkLevel'),
            addCoins: jasmine.createSpy('addCoins'),
            addBoss: jasmine.createSpy('addBoss'),
            addFlawlessStage: jasmine.createSpy('addFlawlessStage'),
            addNewStage: jasmine.createSpy('addNewStage'),
            getToday: jasmine.createSpy('getToday').and.returnValue([]),
          },
        },
        {
          provide: StorageService,
          useValue: {
            getCoins: jasmine.createSpy('getCoins').and.returnValue(Promise.resolve(0)),
            setCoins: jasmine.createSpy('setCoins').and.returnValue(Promise.resolve()),
            getHighscore: jasmine.createSpy('getHighscore').and.returnValue(Promise.resolve([])),
            setHighscore: jasmine.createSpy('setHighscore').and.returnValue(Promise.resolve()),
            getLevelCheckpoint: jasmine.createSpy('getLevelCheckpoint').and.returnValue(Promise.resolve(null)),
            setLevelCheckpoint: jasmine.createSpy('setLevelCheckpoint').and.returnValue(Promise.resolve()),
            clearLevelCheckpoint: jasmine.createSpy('clearLevelCheckpoint').and.returnValue(Promise.resolve()),
            getEndlessRecord: jasmine.createSpy('getEndlessRecord').and.returnValue(Promise.resolve(0)),
            setEndlessRecord: jasmine.createSpy('setEndlessRecord').and.returnValue(Promise.resolve()),
            getCampaignProgress: jasmine.createSpy('getCampaignProgress').and.returnValue(Promise.resolve(0)),
            setCampaignProgress: jasmine.createSpy('setCampaignProgress').and.returnValue(Promise.resolve()),
            getDailyChallenges: jasmine.createSpy('getDailyChallenges').and.returnValue(Promise.resolve(null)),
            setDailyChallenges: jasmine.createSpy('setDailyChallenges').and.returnValue(Promise.resolve()),
          },
        },
      ],
    });
    service = TestBed.inject(GameService);
    objectService = TestBed.inject(ObjectService);
  });

  describe('kill-to-coin logic', () => {
    it('should award 1 coin after every 10 kills by the player', () => {
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });

      for (let i = 0; i < GAME_CONFIG.killsPerCoin; i++) {
        const enemy = createMockObject(ObjectType.enemy, { destroying: true });
        objectService.triggerCallbacks(enemy, playerRocket);
      }

      expect(service.kills()).toBe(GAME_CONFIG.killsPerCoin);
      expect(service.sessionCoins()).toBe(COMBO_REWARD_AT_MAX);
    });

    it('should award bonus coins when a boss enemy is killed by the player', () => {
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
      const bossEnemy = createMockObject(ObjectType.enemy, { destroying: true, isBoss: true });

      objectService.triggerCallbacks(bossEnemy, playerRocket);

      expect(service.kills()).toBe(1);
      expect(service.sessionCoins()).toBe(GAME_CONFIG.boss.coinsReward * BOSS_COMBO_MULTIPLIER);
    });

    it('should show a floating score at the kill position and call out a growing combo', () => {
      const gameScreen = TestBed.inject(GameScreenService) as unknown as { showFloatingText: jasmine.Spy };
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
      const ENEMY_X = 120;
      const ENEMY_Y = 80;

      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, x: ENEMY_X, y: ENEMY_Y }), playerRocket);
      expect(gameScreen.showFloatingText.calls.mostRecent().args).toEqual(jasmine.arrayContaining(['+1', ENEMY_X, ENEMY_Y]));

      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, x: ENEMY_X, y: ENEMY_Y }), playerRocket);
      expect(gameScreen.showFloatingText.calls.mostRecent().args[0]).toContain('COMBO');
    });

    it('should shake and flash the screen when a boss is killed by the player', () => {
      const gameScreen = TestBed.inject(GameScreenService) as unknown as { applyScreenShake: jasmine.Spy; flashScreen: jasmine.Spy };
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });

      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);

      expect(gameScreen.applyScreenShake).toHaveBeenCalled();
      expect(gameScreen.flashScreen).toHaveBeenCalled();
    });

    it('should only shake the screen when a large enemy is killed by the player', () => {
      const gameScreen = TestBed.inject(GameScreenService) as unknown as { applyScreenShake: jasmine.Spy; flashScreen: jasmine.Spy };
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });

      // eslint-disable-next-line no-magic-numbers
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, explosionCount: 3 }), playerRocket);

      expect(gameScreen.applyScreenShake).toHaveBeenCalled();
      expect(gameScreen.flashScreen).not.toHaveBeenCalled();
    });

    it('should NOT award boss bonus coins when a boss is killed by an enemy', () => {
      const enemyShip = createMockObject(ObjectType.enemy);
      const enemyRocket = createMockObject(ObjectType.rocket, { reference: enemyShip });
      const bossEnemy = createMockObject(ObjectType.enemy, { destroying: true, isBoss: true });

      objectService.triggerCallbacks(bossEnemy, enemyRocket);

      expect(service.kills()).toBe(0);
      expect(service.sessionCoins()).toBe(0);
    });

    it('should award 2 coins after 20 kills by the player', () => {
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });

      // eslint-disable-next-line no-magic-numbers
      for (let i = 0; i < GAME_CONFIG.killsPerCoin * 2; i++) {
        const enemy = createMockObject(ObjectType.enemy, { destroying: true });
        objectService.triggerCallbacks(enemy, playerRocket);
      }

      // eslint-disable-next-line no-magic-numbers
      expect(service.kills()).toBe(GAME_CONFIG.killsPerCoin * 2);
      // eslint-disable-next-line no-magic-numbers
      expect(service.sessionCoins()).toBe(COMBO_REWARD_AT_MAX * BOSS_COMBO_MULTIPLIER);
    });

    it('should NOT award a coin before reaching the killsPerCoin threshold', () => {
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });

      for (let i = 0; i < GAME_CONFIG.killsPerCoin - 1; i++) {
        const enemy = createMockObject(ObjectType.enemy, { destroying: true });
        objectService.triggerCallbacks(enemy, playerRocket);
      }

      expect(service.kills()).toBe(GAME_CONFIG.killsPerCoin - 1);
      expect(service.sessionCoins()).toBe(0);
    });

    it('should NOT award a coin for kills by enemies', () => {
      const enemyShip = createMockObject(ObjectType.enemy);
      const enemyRocket = createMockObject(ObjectType.rocket, { reference: enemyShip });

      for (let i = 0; i < GAME_CONFIG.killsPerCoin; i++) {
        const enemy = createMockObject(ObjectType.enemy, { destroying: true });
        objectService.triggerCallbacks(enemy, enemyRocket);
      }

      expect(service.kills()).toBe(0);
      expect(service.sessionCoins()).toBe(0);
    });
  });

  describe('HUD coin display', () => {
    let gameScreenMock: { coins: number };

    beforeEach(() => {
      gameScreenMock = TestBed.inject(GameScreenService) as unknown as { coins: number };
    });

    it('should update HUD coin display when storedCoins changes, even before the game starts', () => {
      const storedCoinsFromStorage = 42;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).storedCoins.set(storedCoinsFromStorage);
      TestBed.flushEffects();

      expect(gameScreenMock.coins).toBe(storedCoinsFromStorage);
    });
  });

  describe('hangar purchases', () => {
    const STORED_COINS = 100;
    const UPGRADE_COST = 30;

    it('should persist the reduced balance so continuing does not restore spent coins', async () => {
      const storage = TestBed.inject(StorageService) as unknown as { getCoins: jasmine.Spy; setCoins: jasmine.Spy };
      let persisted = STORED_COINS;
      storage.getCoins.and.callFake(() => Promise.resolve(persisted));
      storage.setCoins.and.callFake((amount: number) => {
        persisted = amount;
        return Promise.resolve();
      });
      Object.assign(service.shipUpgrades, {
        getUpgradeCost: (): number => UPGRADE_COST,
        isUnlocked: (): boolean => true,
        levelUp: (): Promise<boolean> => Promise.resolve(true),
      });
      service.storedCoins.set(STORED_COINS);

      expect(await service.handleUpgradePurchase('fireRate' as never)).toBeTrue();
      await service.continueFromCheckpoint({} as AppScreen);

      expect(service.coins()).toBe(STORED_COINS - UPGRADE_COST);
    });
  });

  describe('pause state', () => {
    let presentPopupSpy: jasmine.Spy;
    let tickerMock: { add: jasmine.Spy; remove: jasmine.Spy; stop: jasmine.Spy; start: jasmine.Spy };

    beforeEach(() => {
      // Prevent popup construction (which requires PixiJS textures) from interfering
      // with state-machine tests by replacing presentPopup with a no-op spy.
      presentPopupSpy = spyOn(
        service as unknown as { presentPopup: () => Promise<void> },
        'presentPopup',
      ).and.returnValue(Promise.resolve());
      tickerMock = TestBed.inject(ApplicationService).ticker as unknown as typeof tickerMock;
    });

    it('should report paused as false initially', () => {
      expect(service.paused()).toBe(false);
    });

    it('should not change paused state when game is not started', async () => {
      await service.pause();
      expect(service.paused()).toBe(false);
    });

    it('should set paused to true when pause() is called during an active game', async () => {
      await service.start({} as AppScreen);
      await service.pause();
      expect(service.paused()).toBe(true);
    });

    it('should not pause again when already paused (idempotent)', async () => {
      await service.start({} as AppScreen);
      await service.pause();
      await service.pause();

      expect(presentPopupSpy).toHaveBeenCalledTimes(1);
      expect(service.paused()).toBe(true);
    });

    it('should clear paused state when resume() is called', async () => {
      await service.start({} as AppScreen);
      await service.pause();
      await service.resume({} as AppScreen);
      expect(service.paused()).toBe(false);
    });

    it('should keep the ticker running while paused so the pause menu renders', async () => {
      await service.start({} as AppScreen);
      await service.pause();
      expect(tickerMock.stop).not.toHaveBeenCalled();
    });

    it('should stay paused when returning from settings to the pause menu', async () => {
      await service.start({} as AppScreen);
      await service.pause();
      await service.openSettings({} as AppScreen);
      await service.openPause({} as AppScreen);

      expect(presentPopupSpy).toHaveBeenCalledWith(PausePopup);
      expect(service.paused()).toBe(true);
    });
  });

  describe('meteor-to-coin logic', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).started.set(true);
    });

    it('should always award at least 1 coin when a low-energy meteor is destroyed by the player', () => {
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
      // eslint-disable-next-line no-magic-numbers
      const meteor = createMockObject(ObjectType.meteor, { destroying: true, energy: 10 });

      objectService.triggerCallbacks(meteor, playerRocket);

      expect(service.sessionCoins()).toBe(1);
    });

    it('should award more coins for higher energy meteors', () => {
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
      // eslint-disable-next-line no-magic-numbers
      const meteor = createMockObject(ObjectType.meteor, { destroying: true, energy: 40 });

      objectService.triggerCallbacks(meteor, playerRocket);

      // eslint-disable-next-line no-magic-numbers
      expect(service.sessionCoins()).toBe(2);
    });

    it('should NOT award coins when a meteor is destroyed by a non-player', () => {
      const enemyShip = createMockObject(ObjectType.enemy);
      const enemyRocket = createMockObject(ObjectType.rocket, { reference: enemyShip });
      // eslint-disable-next-line no-magic-numbers
      const meteor = createMockObject(ObjectType.meteor, { destroying: true, energy: 10 });

      objectService.triggerCallbacks(meteor, enemyRocket);

      expect(service.sessionCoins()).toBe(0);
    });

    it('should NOT award coins for the same meteor twice', () => {
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
      // eslint-disable-next-line no-magic-numbers
      const meteor = createMockObject(ObjectType.meteor, { destroying: true, energy: 10 });

      objectService.triggerCallbacks(meteor, playerRocket);
      objectService.triggerCallbacks(meteor, playerRocket);

      expect(service.sessionCoins()).toBe(1);
    });
  });

  describe('stage progression logic', () => {
    let gameScreenMock: { showStageAnnouncement: jasmine.Spy };
    let enemyMock: { bossFightActive: boolean; spawnStageBoss: jasmine.Spy };
    let playerShip: ReturnType<typeof createMockObject>;
    let playerRocket: ReturnType<typeof createMockObject>;

    beforeEach(() => {
      // Stage logic is guarded by this.started()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).started.set(true);
      gameScreenMock = TestBed.inject(GameScreenService) as unknown as typeof gameScreenMock;
      enemyMock = TestBed.inject(GameEnemyService) as unknown as typeof enemyMock;
      // Reset boss fight state for each test
      enemyMock.bossFightActive = false;
      playerShip = createMockObject(ObjectType.ship);
      playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
    });

    function triggerStageBoss(stage: number, by: ObjectModelType): void {
      for (let i = 0; i < service.getKillsRequiredForStage(stage); i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), by);
      }
    }

    it('should not spawn a boss before reaching killsPerStage kills', () => {
      for (let i = 0; i < service.getKillsRequiredForStage(1) - 1; i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      }
      expect(enemyMock.spawnStageBoss).not.toHaveBeenCalled();
      expect(enemyMock.bossFightActive).toBeFalse();
    });

    it('should spawn a boss and set bossFightActive at exactly killsPerStage kills', () => {
      triggerStageBoss(1, playerRocket);
      expect(enemyMock.spawnStageBoss).toHaveBeenCalledOnceWith(1);
      expect(enemyMock.bossFightActive).toBeTrue();
    });

    it('should not spawn a second boss during an active boss fight', () => {
      triggerStageBoss(1, playerRocket);
      // Kill more enemies while boss fight is active
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      expect(enemyMock.spawnStageBoss).toHaveBeenCalledTimes(1);
    });

    it('should count kills of special enemy kinds and bosses towards their badges', () => {
      const achievements = TestBed.inject(AchievementService) as unknown as { addCumulative: jasmine.Spy };
      spyOn(TestBed.inject(GameEnemyService), 'getKind').and.returnValue(EnemyKind.sniper);

      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);

      expect(achievements.addCumulative).toHaveBeenCalledWith('sniper_hunter', 1);
      expect(achievements.addCumulative).toHaveBeenCalledWith('boss_slayer', 1);
    });

    it('should advance stage when boss is killed', () => {
      const bossEnemy = createMockObject(ObjectType.enemy, { destroying: true, isBoss: true });
      objectService.triggerCallbacks(bossEnemy, playerRocket);

      expect(service.stage()).toBe(STAGE_TWO);
    });

    it('should count a first-time stage clear at full base energy towards daily missions', () => {
      const daily = TestBed.inject(DailyChallengeService);
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);

      expect(daily.addFlawlessStage).toHaveBeenCalledTimes(1);
      expect(daily.addNewStage).toHaveBeenCalledTimes(1);
    });

    it('should not count a damaged base as a flawless stage', () => {
      TestBed.inject(GameBaseService).energy.set(BASE_MAX_ENERGY - 1);
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);

      expect(TestBed.inject(DailyChallengeService).addFlawlessStage).not.toHaveBeenCalled();
    });

    it('should reset stageKills and clear bossFightActive when boss is killed', () => {
      // Trigger boss
      triggerStageBoss(1, playerRocket);
      // Kill boss
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);

      expect(enemyMock.bossFightActive).toBeFalse();
      expect(service.stage()).toBe(STAGE_TWO);
    });

    it('should end the boss fight and advance the stage when a meteor destroys the boss', () => {
      triggerStageBoss(1, playerRocket);
      objectService.triggerCallbacks(
        createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }),
        createMockObject(ObjectType.meteor),
      );

      expect(enemyMock.bossFightActive).toBeFalse();
      expect(service.stage()).toBe(STAGE_TWO);
    });

    it('should show a stage announcement when boss is killed and game is started', () => {
      const bossEnemy = createMockObject(ObjectType.enemy, { destroying: true, isBoss: true });
      objectService.triggerCallbacks(bossEnemy, playerRocket);

      expect(gameScreenMock.showStageAnnouncement).toHaveBeenCalledOnceWith(STAGE_TWO);
    });

    it('should award stage bonus coins when boss is killed and game is started', () => {
      const coinsBefore = service.sessionCoins();
      const bossEnemy = createMockObject(ObjectType.enemy, { destroying: true, isBoss: true });
      objectService.triggerCallbacks(bossEnemy, playerRocket);

      // Boss coins reward + stage bonus coins
      const STAGE_BONUS_COINS = 10;
      expect(service.sessionCoins()).toBe(
        coinsBefore + GAME_CONFIG.boss.coinsReward * BOSS_COMBO_MULTIPLIER + STAGE_BONUS_COINS,
      );
    });

    it('should trigger victory after the final stage boss is defeated', async () => {
      const presentPopupSpy = spyOn(
        service as unknown as { presentPopup: () => Promise<void> },
        'presentPopup',
      ).and.returnValue(Promise.resolve());
      // Set service to max stage
      service.stage.set(MAX_STAGE);
      const bossEnemy = createMockObject(ObjectType.enemy, { destroying: true, isBoss: true });
      objectService.triggerCallbacks(bossEnemy, playerRocket);
      // the run is ranked against stored scores before the popup opens
      await new Promise((resolve) => setTimeout(resolve));

      expect(presentPopupSpy).toHaveBeenCalledTimes(1);
      expect(service.stage()).toBe(MAX_STAGE); // stage should not advance beyond max
    });

    it('should fire second stage announcement at next boss kill (stage 3)', () => {
      // Complete stage 1
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);
      expect(service.stage()).toBe(STAGE_TWO);

      // Reset boss fight state (as GameEnemyService would)
      enemyMock.bossFightActive = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).stageKills = 0;

      // Complete stage 2
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);
      expect(service.stage()).toBe(STAGE_THREE);
      expect(gameScreenMock.showStageAnnouncement).toHaveBeenCalledTimes(STAGE_TWO);
      expect(gameScreenMock.showStageAnnouncement).toHaveBeenCalledWith(STAGE_THREE);
    });

    it('should not spawn a boss for non-player kills', () => {
      const enemyShip = createMockObject(ObjectType.enemy);
      const enemyRocket = createMockObject(ObjectType.rocket, { reference: enemyShip });

      for (let i = 0; i < service.getKillsRequiredForStage(1); i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), enemyRocket);
      }

      expect(enemyMock.spawnStageBoss).not.toHaveBeenCalled();
    });

    it('should not trigger stage logic when game has not started', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).started.set(false);
      for (let i = 0; i < service.getKillsRequiredForStage(1); i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      }
      expect(enemyMock.spawnStageBoss).not.toHaveBeenCalled();
    });

    it('should grow the kill target for later stages', () => {
      expect(service.getKillsRequiredForStage(1)).toBe(BASE_STAGE_KILL_TARGET);
      expect(service.getKillsRequiredForStage(STAGE_KILL_PLATEAU_END)).toBe(BASE_STAGE_KILL_TARGET);
      expect(service.getKillsRequiredForStage(STAGE_KILL_GROWTH_TRIGGER)).toBe(STAGE_KILL_GROWN_TARGET);
    });

    it('should persist the next checkpoint when a boss is defeated', () => {
      const storage = TestBed.inject(StorageService) as unknown as { setLevelCheckpoint: jasmine.Spy };
      const bossEnemy = createMockObject(ObjectType.enemy, { destroying: true, isBoss: true });

      objectService.triggerCallbacks(bossEnemy, playerRocket);

      expect(storage.setLevelCheckpoint).toHaveBeenCalledWith(STAGE_TWO);
    });

    it('should play the boss debriefing and the next stage briefing when a boss is killed', () => {
      const radio = (TestBed.inject(GameScreenService) as unknown as { showRadioMessages: jasmine.Spy }).showRadioMessages;

      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);

      // a new player reaches stage 2 for the first time, so the tip is included
      expect(radio).toHaveBeenCalledOnceWith([...getBossDebriefing(1), ...getStageBriefing(STAGE_TWO, true)]);
    });

    it('should skip the new player tip on a stage that was already cleared', () => {
      const radio = (TestBed.inject(GameScreenService) as unknown as { showRadioMessages: jasmine.Spy }).showRadioMessages;
      service.clearedStage.set(STAGE_THREE);

      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);

      expect(radio).toHaveBeenCalledOnceWith([...getBossDebriefing(1), ...getStageBriefing(STAGE_TWO)]);
    });

    it('should remember the highest cleared stage for the campaign', () => {
      const storage = TestBed.inject(StorageService) as unknown as { setCampaignProgress: jasmine.Spy };
      service.stage.set(STAGE_THREE);

      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerRocket);

      expect(service.clearedStage()).toBe(STAGE_THREE);
      expect(storage.setCampaignProgress).toHaveBeenCalledOnceWith(STAGE_THREE);
    });
  });

  describe('saved level continuation', () => {
    it('should save stage 1 when a new game starts', async () => {
      const storage = TestBed.inject(StorageService) as unknown as { setLevelCheckpoint: jasmine.Spy };

      await service.start({} as AppScreen);

      expect(service.stage()).toBe(1);
      expect(storage.setLevelCheckpoint).toHaveBeenCalledWith(1);
    });

    it('should continue from the saved checkpoint', async () => {
      const storage = TestBed.inject(StorageService) as unknown as { setLevelCheckpoint: jasmine.Spy };
      service.savedStage.set(SAVED_STAGE_SEVEN);

      await service.continueFromCheckpoint({} as AppScreen);

      expect(service.stage()).toBe(SAVED_STAGE_SEVEN);
      expect(storage.setLevelCheckpoint).toHaveBeenCalledWith(SAVED_STAGE_SEVEN);
    });

    it('should play the briefing of the stage the run starts on', async () => {
      const radio = (TestBed.inject(GameScreenService) as unknown as { showRadioMessages: jasmine.Spy }).showRadioMessages;
      service.savedStage.set(SAVED_STAGE_SEVEN);

      await service.continueFromCheckpoint({} as AppScreen);

      expect(radio).toHaveBeenCalledOnceWith(getStageBriefing(SAVED_STAGE_SEVEN));
    });
  });

  describe('endless mode', () => {
    // eslint-disable-next-line no-magic-numbers
    const SECOND_ENDLESS_STAGE = MAX_STAGE + 2;
    let storage: { setLevelCheckpoint: jasmine.Spy; setCampaignProgress: jasmine.Spy; setEndlessRecord: jasmine.Spy };

    beforeEach(() => {
      storage = TestBed.inject(StorageService) as unknown as typeof storage;
      spyOn(service as unknown as { presentPopup: () => Promise<void> }, 'presentPopup').and.returnValue(Promise.resolve());
    });

    it('should stay locked until the campaign is cleared', async () => {
      await service.startEndless({} as AppScreen);

      expect(service.endless()).toBeFalse();
    });

    it('should start right after the last stage without touching the checkpoint', async () => {
      service.clearedStage.set(MAX_STAGE);

      await service.startEndless({} as AppScreen);

      expect(service.endless()).toBeTrue();
      expect(service.stage()).toBe(MAX_STAGE + 1);
      expect(storage.setLevelCheckpoint).not.toHaveBeenCalled();
    });

    it('should keep advancing past bosses and store each reached stage as the record', async () => {
      service.clearedStage.set(MAX_STAGE);
      await service.startEndless({} as AppScreen);
      const playerShip = createMockObject(ObjectType.ship);
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true, isBoss: true }), playerShip);

      expect(service.stage()).toBe(SECOND_ENDLESS_STAGE);
      expect(storage.setCampaignProgress).not.toHaveBeenCalled();
      expect(storage.setLevelCheckpoint).not.toHaveBeenCalled();
      expect(service.endlessRecord()).toBe(SECOND_ENDLESS_STAGE);
      expect(storage.setEndlessRecord).toHaveBeenCalledOnceWith(SECOND_ENDLESS_STAGE);
    });

    it('should record the stage the endless run ended on, like the endless highscore tab', async () => {
      service.clearedStage.set(MAX_STAGE);
      await service.startEndless({} as AppScreen);
      service.stage.set(SECOND_ENDLESS_STAGE);

      await (service as unknown as { finishRun: (popup: unknown) => Promise<void> }).finishRun(null);

      expect(service.endlessRecord()).toBe(SECOND_ENDLESS_STAGE);
    });
  });

  it('should play music only while the game runs', () => {
    const sound = TestBed.inject(SoundService) as jasmine.SpyObj<SoundService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).started.set(true);
    TestBed.tick();
    expect(sound.startMusic).toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).started.set(false);
    TestBed.tick();
    expect(sound.stopMusic).toHaveBeenCalled();
  });

  describe('damage tracking and survival streak', () => {
    const STREAK_INTERVAL_MS = 15_000;
    const STREAK_BONUS_COINS = 3;
    let tickerCallback: (delta: { deltaMS: number }) => void;
    let gameScreenMock: { applyScreenShake: jasmine.Spy; showFloatingText: jasmine.Spy };
    let shipInstance: { autoFire: boolean; energy: number; x: number; y: number };

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).started.set(true);
      shipInstance = TestBed.inject(GameShipService).instance as typeof shipInstance;
      shipInstance.energy = 10;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).lastShipEnergy = 10;
      // Prevent YouAreDeadPopup construction (translation not fully mocked)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spyOn(service as any, 'presentPopup').and.returnValue(Promise.resolve());
      // Register the ticker callback by calling setup()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).setup();
      const tickerMock = TestBed.inject(ApplicationService).ticker as unknown as { add: jasmine.Spy };
      tickerCallback = tickerMock.add.calls.mostRecent().args[0] as typeof tickerCallback;
      gameScreenMock = TestBed.inject(GameScreenService) as unknown as typeof gameScreenMock;
    });

    it('should call applyScreenShake when ship energy decreases', () => {
      shipInstance.energy = 8;
      tickerCallback({ deltaMS: 16 });
      expect(gameScreenMock.applyScreenShake).toHaveBeenCalled();
      expect((gameScreenMock as unknown as { flashScreen: jasmine.Spy }).flashScreen).toHaveBeenCalled();
    });

    it('should call applyScreenShake even on the killing blow (energy → 0)', () => {
      shipInstance.energy = 0;
      tickerCallback({ deltaMS: 16 });
      expect(gameScreenMock.applyScreenShake).toHaveBeenCalled();
    });

    it('should not call applyScreenShake when energy is unchanged', () => {
      tickerCallback({ deltaMS: 16 });
      expect(gameScreenMock.applyScreenShake).not.toHaveBeenCalled();
    });

    it('should not call applyScreenShake when energy increases (healing)', () => {
      shipInstance.energy = 15;
      tickerCallback({ deltaMS: 16 });
      expect(gameScreenMock.applyScreenShake).not.toHaveBeenCalled();
    });

    it('should award STREAK_BONUS_COINS after STREAK_INTERVAL_MS of undamaged time', () => {
      const coinsBefore = service.sessionCoins();
      tickerCallback({ deltaMS: STREAK_INTERVAL_MS });
      expect(service.sessionCoins()).toBe(coinsBefore + STREAK_BONUS_COINS);
      expect(gameScreenMock.showFloatingText).toHaveBeenCalledWith(
        `🛡 +${STREAK_BONUS_COINS}`,
        shipInstance.x,
        shipInstance.y,
      );
    });

    it('should not award streak coins before STREAK_INTERVAL_MS elapses', () => {
      const coinsBefore = service.sessionCoins();
      tickerCallback({ deltaMS: STREAK_INTERVAL_MS - 1 });
      expect(service.sessionCoins()).toBe(coinsBefore);
      expect(gameScreenMock.showFloatingText).not.toHaveBeenCalled();
    });

    it('should reset the streak timer on damage and not award until a new full interval', () => {
      // partially advance streak
      tickerCallback({ deltaMS: STREAK_INTERVAL_MS - 1 });
      // take damage — this resets streak
      shipInstance.energy = 8;
      tickerCallback({ deltaMS: 16 });
      // energy stays at 8 (no more damage), but streak must restart from scratch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).lastShipEnergy = 8;
      // advance almost a full interval — should NOT award yet
      tickerCallback({ deltaMS: STREAK_INTERVAL_MS - 1 });
      expect(gameScreenMock.showFloatingText).not.toHaveBeenCalled();
    });

    it('should only award one streak bonus per tick even if delta is very large', () => {
      const coinsBefore = service.sessionCoins();
      // simulate a giant delta (3× the interval — e.g. tab was suspended)
      tickerCallback({ deltaMS: STREAK_INTERVAL_MS * STAGE_THREE });
      // only one bonus should be awarded (cap per tick)
      expect(service.sessionCoins()).toBe(coinsBefore + STREAK_BONUS_COINS);
      expect(gameScreenMock.showFloatingText).toHaveBeenCalledTimes(1);
    });

    it('should not accumulate streak while ship energy is 0', () => {
      shipInstance.energy = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).lastShipEnergy = 0;
      tickerCallback({ deltaMS: STREAK_INTERVAL_MS + 1 });
      expect(gameScreenMock.showFloatingText).not.toHaveBeenCalled();
    });
  });
});
