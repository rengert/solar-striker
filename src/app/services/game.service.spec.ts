import { TestBed } from '@angular/core/testing';
import { ObjectModelType, ObjectService } from './object.service';
import { ApplicationService } from './application.service';
import { GameService } from './game.service';
import { ObjectType } from '../models/pixijs/object-type.enum';
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
            },
            screen: { width: 800, height: 600 },
          },
        },
        { provide: GameCollectableService, useValue: {} },
        { provide: GameEnemyService, useValue: {} },
        { provide: GameLandscapeService, useValue: {} },
        { provide: GameMeteorService, useValue: {} },
        { provide: GameScreenService, useValue: { coins: 0, kills: 0, level: 0 } },
        { provide: GameShipService, useValue: {} },
        { provide: GameShotService, useValue: {} },
        { provide: ShipUpgradeService, useValue: {} },
        { provide: TranslationService, useValue: {} },
        {
          provide: StorageService,
          useValue: {
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
