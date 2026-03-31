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
import { ShipUpgradeService } from './ship-upgrade.service';
import { StorageService } from './storage.service';
import { TranslationService } from './translation.service';
import { AchievementService } from './achievement.service';
import { GAME_CONFIG } from '../game-constants';

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
            stage: { addChild: jasmine.createSpy('addChild') },
            ticker: {
              add: jasmine.createSpy('add'),
              remove: jasmine.createSpy('remove'),
              stop: jasmine.createSpy('stop'),
              start: jasmine.createSpy('start'),
            },
            screen: { width: 800, height: 600 },
          },
        },
        { provide: GameCollectableService, useValue: {} },
        { provide: GameEnemyService, useValue: {} },
        { provide: GameLandscapeService, useValue: {} },
        { provide: GameMeteorService, useValue: {} },
        {
          provide: GameScreenService,
          useValue: { coins: 0, kills: 0, level: 0, pauseButtonVisible: false, onPause: undefined },
        },
        {
          provide: GameShipService,
          useValue: { instance: { autoFire: false }, applyUpgrades: jasmine.createSpy('applyUpgrades') },
        },
        { provide: GameShotService, useValue: {} },
        { provide: ShipUpgradeService, useValue: {} },
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
});
