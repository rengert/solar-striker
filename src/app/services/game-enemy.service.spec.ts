import { TestBed } from '@angular/core/testing';
import { Texture, Ticker } from 'pixi.js';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';
import { BossPattern, EnemyKind, GameEnemyService, getBossPattern, getSpawnInterval } from './game-enemy.service';
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

  it('should report an enemy that got past the bottom edge, but not one still on screen', () => {
    const passed = createEnemy();
    passed.y = MOCK_SCREEN_HEIGHT + OFF_SCREEN_BUFFER + 1;
    const onScreen = createEnemy();
    // eslint-disable-next-line no-magic-numbers
    onScreen.y = 300;
    objectService.add(passed);
    objectService.add(onScreen);
    service.onEnemyPassed = jasmine.createSpy('onEnemyPassed');

    service.update(createMockTicker(), 1);

    expect(service.onEnemyPassed).toHaveBeenCalledOnceWith(passed);
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

/* eslint-disable no-magic-numbers */
describe('GameEnemyService - boss patterns', () => {
  let service: GameEnemyService;
  let objectService: ObjectService;
  let shotService: { shot: jasmine.Spy; fireRadial: jasmine.Spy };

  beforeEach(() => {
    shotService = { shot: jasmine.createSpy('shot'), fireRadial: jasmine.createSpy('fireRadial') };
    TestBed.configureTestingModule({
      providers: [
        GameEnemyService,
        ObjectService,
        { provide: ApplicationService, useValue: buildApplicationServiceMock() },
        { provide: ExplosionService, useValue: { explode: jasmine.createSpy('explode') } },
        { provide: GameShotService, useValue: shotService },
        { provide: GameScreenService, useValue: { showBossWarning: jasmine.createSpy('showBossWarning') } },
      ],
    });
    service = TestBed.inject(GameEnemyService);
    objectService = TestBed.inject(ObjectService);
    (service as unknown as { enemySprite: unknown }).enemySprite = { animations: { frame: [Texture.EMPTY] } };
  });

  function spawnBoss(stage: number): Ship {
    service.spawnStageBoss(stage);
    const boss = objectService.enemies()[0] as Ship;
    // skip the fly-in
    boss.y = MOCK_SCREEN_HEIGHT;
    service.update(createMockTicker(), stage);
    return boss;
  }

  it('cycles sweeper, orbiter and hunter by stage', () => {
    expect([1, 2, 3, 4, 5, 6].map(getBossPattern)).toEqual([
      BossPattern.sweeper, BossPattern.orbiter, BossPattern.hunter,
      BossPattern.sweeper, BossPattern.orbiter, BossPattern.hunter,
    ]);
  });

  it('rotates through all five bosses in endless mode, starting with the spiral', () => {
    expect([101, 102, 103, 104, 105, 106].map(getBossPattern)).toEqual([
      BossPattern.spiral, BossPattern.sweeper, BossPattern.warper,
      BossPattern.orbiter, BossPattern.hunter, BossPattern.spiral,
    ]);
  });

  it('spiral fires two opposite shots that turn with every attack', () => {
    const boss = spawnBoss(101);

    service.update(createMockTicker(450), 101);
    service.update(createMockTicker(450), 101);

    const [first, second] = shotService.fireRadial.calls.all().map((call) => call.args as [Ship, number, number, number]);
    expect(first[0]).toBe(boss);
    expect(first[1]).toBe(2);
    expect(second[3]).toBeGreaterThan(first[3]);
  });

  it('warper jumps, fades in and only then fires', () => {
    const boss = spawnBoss(103);
    const x = boss.x;
    spyOn(Math, 'random').and.returnValue(0);

    service.update(createMockTicker(2100), 103);

    expect(boss.x).not.toBe(x);
    expect(boss.alpha).toBeLessThan(1);
    expect(shotService.fireRadial).not.toHaveBeenCalled();

    service.update(createMockTicker(500), 103);

    expect(shotService.fireRadial).toHaveBeenCalledOnceWith(boss, 5, jasmine.any(Number), jasmine.any(Number), jasmine.any(Number));
  });

  it('stops descending at its hover height', () => {
    const boss = spawnBoss(1);

    expect(boss.y).toBeLessThan(MOCK_SCREEN_HEIGHT / 2);
  });

  it('orbiter fires a full ring after its attack interval', () => {
    const boss = spawnBoss(2);
    expect(shotService.fireRadial).not.toHaveBeenCalled();

    service.update(createMockTicker(2300), 2);

    expect(shotService.fireRadial).toHaveBeenCalledOnceWith(boss, 12, jasmine.any(Number));
  });

  it('hunter aims its volley at the player', () => {
    const player = new Ship(ShipType.ship, shotService as unknown as GameShotService, null as unknown as ExplosionService, 0, [Texture.EMPTY]);
    player.x = 0;
    player.y = MOCK_SCREEN_HEIGHT;
    objectService.add(player);
    const boss = spawnBoss(3);

    service.update(createMockTicker(1700), 3);

    const [, count, , fromAngle, arc] = shotService.fireRadial.calls.mostRecent().args as number[];
    const aim = Math.atan2(player.y - boss.y, player.x - boss.x);
    expect(count).toBe(3);
    expect(fromAngle + arc / 2).toBeCloseTo(aim);
  });

  it('attacks faster below half energy', () => {
    const boss = spawnBoss(1);
    boss.energy = 1;
    service.update(createMockTicker(2600), 1);
    shotService.fireRadial.calls.reset();

    // 0.6 * 2600 = 1560ms enraged interval
    service.update(createMockTicker(1600), 1);

    expect(shotService.fireRadial).toHaveBeenCalledTimes(1);
  });
});

describe('GameEnemyService - enemy kinds', () => {
  let service: GameEnemyService;
  let objectService: ObjectService;
  let shotService: { shot: jasmine.Spy; fireRadial: jasmine.Spy };
  let player: Ship;

  beforeEach(() => {
    shotService = { shot: jasmine.createSpy('shot'), fireRadial: jasmine.createSpy('fireRadial') };
    TestBed.configureTestingModule({
      providers: [
        GameEnemyService,
        ObjectService,
        { provide: ApplicationService, useValue: buildApplicationServiceMock() },
        { provide: ExplosionService, useValue: { explode: jasmine.createSpy('explode') } },
        { provide: GameShotService, useValue: shotService },
        { provide: GameScreenService, useValue: { showBossWarning: jasmine.createSpy('showBossWarning') } },
      ],
    });
    service = TestBed.inject(GameEnemyService);
    objectService = TestBed.inject(ObjectService);
    (service as unknown as { enemySprite: unknown }).enemySprite = { animations: { frame: [Texture.EMPTY] } };
    player = new Ship(ShipType.ship, shotService as unknown as GameShotService, null as unknown as ExplosionService, 0, [Texture.EMPTY]);
    player.x = 50;
    player.y = MOCK_SCREEN_HEIGHT - 50;
    objectService.add(player);
  });

  it('gives every kind its own colour', () => {
    const tints = Object.values(EnemyKind).map((kind) => service.spawnKind(1, kind).tint);
    expect(new Set(tints).size).toBe(tints.length);
  });

  it('only spawns the endless kinds in endless mode', () => {
    const pickEnemyKind = (): EnemyKind | undefined =>
      (service as unknown as { pickEnemyKind(): EnemyKind | undefined }).pickEnemyKind();
    // a roll past the three campaign kinds (0.28) lands on the bomber
    spyOn(Math, 'random').and.returnValue(0.3);

    expect(pickEnemyKind()).toBeUndefined();
    service.endless = true;
    expect(pickEnemyKind()).toBe(EnemyKind.bomber);
  });

  it('bomber drops a ring of shots', () => {
    const bomber = service.spawnKind(101, EnemyKind.bomber);
    bomber.y = 100;

    service.update(createMockTicker(), 101);
    service.update(createMockTicker(1300), 101);

    const rings = shotService.fireRadial.calls.all().filter((call) => call.args[0] === bomber);
    expect(rings.length).toBe(1);
    expect(rings[0].args[1]).toBe(8);
  });

  it('bomber holds its ring while above the screen', () => {
    const bomber = service.spawnKind(101, EnemyKind.bomber);
    bomber.y = -1000;

    service.update(createMockTicker(), 101);
    service.update(createMockTicker(1300), 101);

    expect(shotService.fireRadial.calls.all().filter((call) => call.args[0] === bomber).length).toBe(0);
  });

  it('phantom blinks to a new spot and fires at the player', () => {
    const phantom = service.spawnKind(101, EnemyKind.phantom);
    phantom.y = MOCK_SCREEN_HEIGHT / 2;
    service.update(createMockTicker(), 101);
    spyOn(Math, 'random').and.returnValue(0);

    service.update(createMockTicker(1600), 101);

    expect(phantom.x).toBe(phantom.width / 2);
    expect(phantom.alpha).toBeLessThan(1);
    expect(shotService.fireRadial.calls.all().filter((call) => call.args[0] === phantom).length).toBe(0);

    // fires only once faded back in
    service.update(createMockTicker(500), 101);

    const [shooter, count, , angle] = shotService.fireRadial.calls.mostRecent().args as [Ship, number, number, number];
    expect(shooter).toBe(phantom);
    expect(count).toBe(1);
    expect(angle).toBeCloseTo(Math.atan2(player.y - phantom.y, player.x - phantom.x));
  });

  it('diver locks onto the player and dives', () => {
    const diver = service.spawnKind(1, EnemyKind.diver);
    diver.y = MOCK_SCREEN_HEIGHT / 2;

    service.update(createMockTicker(), 1);

    expect(diver.targetX).toBe(player.x);
    expect(diver.y).toBeGreaterThan(MOCK_SCREEN_HEIGHT / 2);
  });

  it('weaver swings sideways', () => {
    const weaver = service.spawnKind(1, EnemyKind.weaver);
    const startX = weaver.x;

    service.update(createMockTicker(400), 1);

    expect(weaver.x).toBeGreaterThan(startX);
  });

  it('sniper holds its post, fires aimed shots and then leaves', () => {
    const sniper = service.spawnKind(1, EnemyKind.sniper);
    sniper.y = MOCK_SCREEN_HEIGHT;

    service.update(createMockTicker(), 1);
    expect(sniper.y).toBe(MOCK_SCREEN_HEIGHT * 0.2);

    service.update(createMockTicker(800), 1);
    const [shooter, count, , angle] = shotService.fireRadial.calls.mostRecent().args as [Ship, number, number, number];
    expect(shooter).toBe(sniper);
    expect(count).toBe(1);
    expect(angle).toBeCloseTo(Math.atan2(player.y - sniper.y, player.x - sniper.x));

    service.update(createMockTicker(5000), 1);
    sniper.y += 10;
    service.update(createMockTicker(), 1);
    expect(sniper.y).toBeGreaterThan(MOCK_SCREEN_HEIGHT * 0.2);
  });
});

describe('getSpawnInterval', () => {
  it('keeps spawning enemies on very high endless levels', () => {
    // eslint-disable-next-line no-magic-numbers
    expect(getSpawnInterval(600)).toBe(1);
    expect(getSpawnInterval(1)).toBeGreaterThan(1);
  });
});
