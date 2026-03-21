import { TestBed } from '@angular/core/testing';
import { Texture, Ticker } from 'pixi.js';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';
import { GameEnemyService } from './game-enemy.service';
import { GameScreenService } from './game-screen.service';
import { GameShotService } from './game-shot.service';
import { ObjectService } from './object.service';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { OFF_SCREEN_BUFFER } from '../game-constants';

const MOCK_SCREEN_WIDTH = 400;
const MOCK_SCREEN_HEIGHT = 600;
const ENEMY_MAX_ENERGY = 5;
const ENEMY_SPEED = 1;
const DEFAULT_DELTA_MS = 16;

function buildApplicationServiceMock(): Record<string, unknown> {
  return {
    stage: { addChild: jasmine.createSpy('addChild') },
    screen: { width: MOCK_SCREEN_WIDTH, height: MOCK_SCREEN_HEIGHT },
    ticker: {
      add: jasmine.createSpy('add'),
      remove: jasmine.createSpy('remove'),
    },
  };
}

function createMockTicker(deltaMS = DEFAULT_DELTA_MS): Ticker {
  return { deltaMS } as unknown as Ticker;
}

function createEnemy(maxEnergy = ENEMY_MAX_ENERGY): Ship {
  const mockShotService = {
    shot: jasmine.createSpy('shot'),
    init: jasmine.createSpy('init'),
  } as unknown as GameShotService;
  const mockExplosionService = {
    explode: jasmine.createSpy('explode').and.returnValue(Promise.resolve()),
  } as unknown as ExplosionService;

  const enemy = new Ship(ShipType.enemy, mockShotService, mockExplosionService, ENEMY_SPEED, [Texture.EMPTY]);
  enemy.maxEnergy = maxEnergy;
  enemy.energy = maxEnergy;
  return enemy;
}

describe('GameEnemyService - enemy recycling', () => {
  let service: GameEnemyService;
  let objectService: ObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameEnemyService,
        ObjectService,
        {
          provide: ApplicationService,
          useValue: buildApplicationServiceMock(),
        },
        {
          provide: ExplosionService,
          useValue: {
            explode: jasmine.createSpy('explode').and.returnValue(Promise.resolve()),
          },
        },
        {
          provide: GameShotService,
          useValue: { shot: jasmine.createSpy('shot') },
        },
        {
          provide: GameScreenService,
          useValue: { showBossWarning: jasmine.createSpy('showBossWarning') },
        },
      ],
    });

    service = TestBed.inject(GameEnemyService);
    objectService = TestBed.inject(ObjectService);
  });

  it('should reset energy to maxEnergy when an enemy goes off-screen', () => {
    const enemy = createEnemy(ENEMY_MAX_ENERGY);
    // Damage the enemy before it escapes
    enemy.energy = 1;
    enemy.y = MOCK_SCREEN_HEIGHT + OFF_SCREEN_BUFFER + 1;
    objectService.add(enemy);

    service.update(createMockTicker(), 1);

    expect(enemy.energy).toBe(ENEMY_MAX_ENERGY);
  });

  it('should reset rotation to 0 when an enemy goes off-screen', () => {
    const enemy = createEnemy();
    // eslint-disable-next-line no-magic-numbers
    enemy.rotation = Math.PI / 4;
    enemy.y = MOCK_SCREEN_HEIGHT + OFF_SCREEN_BUFFER + 1;
    objectService.add(enemy);

    service.update(createMockTicker(), 1);

    expect(enemy.rotation).toBe(0);
  });

  it('should reposition an off-screen enemy to y=0', () => {
    const enemy = createEnemy();
    enemy.y = MOCK_SCREEN_HEIGHT + OFF_SCREEN_BUFFER + 1;
    objectService.add(enemy);

    service.update(createMockTicker(), 1);

    expect(enemy.y).toBe(0);
  });

  it('should NOT reset energy for an enemy that is still on-screen', () => {
    const enemy = createEnemy(ENEMY_MAX_ENERGY);
    enemy.energy = 1;
    // eslint-disable-next-line no-magic-numbers
    enemy.y = 300;
    objectService.add(enemy);

    service.update(createMockTicker(), 1);

    expect(enemy.energy).toBe(1);
  });
});
