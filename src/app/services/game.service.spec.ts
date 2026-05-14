import { TestBed } from '@angular/core/testing';
import { ObjectModelType, ObjectService } from './object.service';
import { ApplicationService } from './application.service';
import { GameService } from './game.service';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { AppScreen } from '../models/pixijs/app-screen';
import { GameCollectableService } from './game-collectable.service';
import { GameEnemyService } from './game-enemy.service';
import { GameLandscapeService } from './game-landscape.service';
import { GameMeteorService } from './game-meteor.service';
import { GameScreenService } from './game-screen.service';
import { GameShipService } from './game-ship.service';
import { GameShotService } from './game-shot.service';
import { PlayerShipService } from './player-ship.service';
import { ShipUpgradeService } from './ship-upgrade.service';
import { StorageService } from './storage.service';
import { TranslationService } from './translation.service';
import { AchievementService } from './achievement.service';
import { GAME_CONFIG } from '../game-constants';
import { DEFAULT_PLAYER_SHIP_CLASS, PLAYER_SHIP_DEFINITIONS } from '../models/player-ship-class.model';

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
        { provide: GameEnemyService, useValue: { update: jasmine.createSpy('update') } },
        { provide: GameLandscapeService, useValue: { update: jasmine.createSpy('update') } },
        { provide: GameMeteorService, useValue: { update: jasmine.createSpy('update') } },
        {
          provide: GameScreenService,
          useValue: {
            coins: 0,
            kills: 0,
            level: 0,
            pauseButtonVisible: false,
            onPause: undefined,
            showWaveAnnouncement: jasmine.createSpy('showWaveAnnouncement'),
            applyScreenShake: jasmine.createSpy('applyScreenShake'),
            showFloatingText: jasmine.createSpy('showFloatingText'),
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
          provide: StorageService,
          useValue: {
            getCoins: jasmine.createSpy('getCoins').and.returnValue(Promise.resolve(0)),
            setCoins: jasmine.createSpy('setCoins').and.returnValue(Promise.resolve()),
            setHighscore: jasmine.createSpy('setHighscore').and.returnValue(Promise.resolve()),
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
      expect(service.sessionCoins()).toBe(1);
    });

    it('should award bonus coins when a boss enemy is killed by the player', () => {
      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
      const bossEnemy = createMockObject(ObjectType.enemy, { destroying: true, isBoss: true });

      objectService.triggerCallbacks(bossEnemy, playerRocket);

      expect(service.kills()).toBe(1);
      expect(service.sessionCoins()).toBe(GAME_CONFIG.boss.coinsReward);
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
      expect(service.sessionCoins()).toBe(2);
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

    it('should stop the ticker when pause() is called during an active game', async () => {
      await service.start({} as AppScreen);
      await service.pause();
      expect(tickerMock.stop).toHaveBeenCalledTimes(1);
    });

    it('should not stop the ticker when game is not started', async () => {
      await service.pause();
      expect(tickerMock.stop).not.toHaveBeenCalled();
    });

    it('should start the ticker when resume() is called', async () => {
      await service.start({} as AppScreen);
      await service.pause();
      await service.resume({} as AppScreen);
      expect(tickerMock.start).toHaveBeenCalledTimes(1);
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

  describe('wave milestone logic', () => {
    const KILLS_PER_WAVE = 25;
    const WAVE_BONUS_COINS = 5;
    let gameScreenMock: { showWaveAnnouncement: jasmine.Spy };
    let playerShip: ReturnType<typeof createMockObject>;
    let playerRocket: ReturnType<typeof createMockObject>;

    beforeEach(() => {
      // Wave logic is guarded by this.started()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).started.set(true);
      gameScreenMock = TestBed.inject(GameScreenService) as unknown as typeof gameScreenMock;
      playerShip = createMockObject(ObjectType.ship);
      playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
    });

    it('should not fire a wave announcement before reaching 25 kills', () => {
      for (let i = 0; i < KILLS_PER_WAVE - 1; i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      }
      expect(gameScreenMock.showWaveAnnouncement).not.toHaveBeenCalled();
    });

    it('should fire wave announcement at exactly 25 kills (wave 2)', () => {
      for (let i = 0; i < KILLS_PER_WAVE; i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      }
      expect(gameScreenMock.showWaveAnnouncement).toHaveBeenCalledOnceWith(2);
    });

    it('should award WAVE_BONUS_COINS flat coins at the wave milestone', () => {
      // Trigger 24 kills first (no wave boundary crossed, combo accumulates)
      for (let i = 0; i < KILLS_PER_WAVE - 1; i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      }
      const coinsBefore = service.sessionCoins();
      // Kill 25 crosses the wave boundary; kill 25 is not a killsPerCoin multiple so only wave bonus fires
      objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      const coinsDelta = service.sessionCoins() - coinsBefore;
      // Bonus must be exactly WAVE_BONUS_COINS (flat, not multiplied by combo)
      expect(coinsDelta).toBe(WAVE_BONUS_COINS);
    });

    it('should not refire the wave announcement for kills within the same wave', () => {
      for (let i = 0; i < KILLS_PER_WAVE + 1; i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      }
      expect(gameScreenMock.showWaveAnnouncement).toHaveBeenCalledTimes(1);
    });

    it('should fire a second wave announcement at 50 kills (wave 3)', () => {
      for (let i = 0; i < KILLS_PER_WAVE * 2; i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      }
      expect(gameScreenMock.showWaveAnnouncement).toHaveBeenCalledTimes(2);
      expect(gameScreenMock.showWaveAnnouncement).toHaveBeenCalledWith(3);
    });

    it('should not fire wave announcement when game has not started', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).started.set(false);
      for (let i = 0; i < KILLS_PER_WAVE; i++) {
        objectService.triggerCallbacks(createMockObject(ObjectType.enemy, { destroying: true }), playerRocket);
      }
      expect(gameScreenMock.showWaveAnnouncement).not.toHaveBeenCalled();
    });
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
      tickerCallback({ deltaMS: STREAK_INTERVAL_MS * 3 });
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
