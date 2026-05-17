import { TestBed } from '@angular/core/testing';
import { ObjectModelType, ObjectService } from './object.service';
import { ApplicationService } from './application.service';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { GameCollectableService } from './game-collectable.service';
import { AchievementService } from './achievement.service';
import { GameShotService } from './game-shot.service';
import { MAX_SHOT_POWER, OFF_SCREEN_BUFFER, SHIELD_DURATION_MS } from '../game-constants';

const MOCK_SCREEN_HEIGHT = 600;
const MOCK_SCREEN_WIDTH = 400;

function createMockShip(overrides: Record<string, unknown> = {}): ObjectModelType {
  return {
    type: ObjectType.ship,
    destroying: false,
    destroyed: false,
    reference: undefined,
    energy: 10,
    power: 1,
    shotSpeed: 1.5,
    shotPower: 1,
    shieldTicks: 0,
    ...overrides,
  } as unknown as ObjectModelType;
}

function createMockPowerUp(powerUpConfig: {
  speed: number;
  shot: number;
  energy: number;
  shield?: number;
  nuke?: boolean;
}): ObjectModelType {
  return {
    type: ObjectType.collectable,
    destroying: true,
    destroyed: false,
    reference: undefined,
    energy: 0,
    power: 0,
    config: {
      powerUp: powerUpConfig,
    },
  } as unknown as ObjectModelType;
}

function createMockEnemy(): ObjectModelType {
  const enemy: Record<string, unknown> = {
    type: ObjectType.enemy,
    destroying: false,
    destroyed: false,
    reference: undefined,
    energy: 5,
    power: 1,
    explode: jasmine.createSpy('explode').and.callFake(() => {
      enemy['destroying'] = true;
    }),
  };
  return enemy as unknown as ObjectModelType;
}

function createMockMeteor(): ObjectModelType {
  const meteor: Record<string, unknown> = {
    type: ObjectType.meteor,
    destroying: false,
    destroyed: false,
    reference: undefined,
    energy: 10,
    power: 0,
    explode: jasmine.createSpy('explode').and.callFake(() => {
      meteor['destroying'] = true;
    }),
  };
  return meteor as unknown as ObjectModelType;
}

function buildApplicationServiceMock(): Record<string, unknown> {
  return {
    stage: { addChild: jasmine.createSpy('addChild') },
    screen: { height: MOCK_SCREEN_HEIGHT, width: MOCK_SCREEN_WIDTH },
    ticker: {
      add: jasmine.createSpy('add'),
      remove: jasmine.createSpy('remove'),
    },
  };
}

describe('GameCollectableService - collectPowerUp', () => {
  let objectService: ObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectService,
        GameCollectableService,
        {
          provide: ApplicationService,
          useValue: buildApplicationServiceMock(),
        },
        {
          provide: AchievementService,
          useValue: {
            checkMilestone: jasmine.createSpy('checkMilestone'),
          },
        },
        {
          provide: GameShotService,
          useValue: {
            fireOrbitalStrike: jasmine.createSpy('fireOrbitalStrike'),
          },
        },
      ],
    });

    objectService = TestBed.inject(ObjectService);
    // Instantiate service so it registers its onDestroyed callbacks
    TestBed.inject(GameCollectableService);
  });

  it('should increase ship.shotSpeed via the speed config field', () => {
    const ship = createMockShip({ shotSpeed: 1.5 });
    const powerUp = createMockPowerUp({ speed: 0.1, shot: 0, energy: 0 });

    objectService.triggerCallbacks(powerUp, ship);

    // eslint-disable-next-line no-magic-numbers
    expect((ship as unknown as { shotSpeed: number }).shotSpeed).toBeCloseTo(1.6);
  });

  it('should increase ship.shotPower via the shot config field', () => {
    const ship = createMockShip({ shotPower: 1 });
    const powerUp = createMockPowerUp({ speed: 0, shot: 1, energy: 0 });

    objectService.triggerCallbacks(powerUp, ship);

    // eslint-disable-next-line no-magic-numbers
    expect((ship as unknown as { shotPower: number }).shotPower).toBe(2);
  });

  it('should NOT increase ship.shotPower beyond MAX_SHOT_POWER', () => {
    const ship = createMockShip({ shotPower: MAX_SHOT_POWER });
    const powerUp = createMockPowerUp({ speed: 0, shot: 1, energy: 0 });

    objectService.triggerCallbacks(powerUp, ship);

    expect((ship as unknown as { shotPower: number }).shotPower).toBe(MAX_SHOT_POWER);
  });

  it('should cap ship.shotPower at MAX_SHOT_POWER when collecting multiple shot power-ups', () => {
    const ship = createMockShip({ shotPower: MAX_SHOT_POWER - 1 });
    const powerUp = createMockPowerUp({ speed: 0, shot: 1, energy: 0 });

    objectService.triggerCallbacks(powerUp, ship);
    objectService.triggerCallbacks(powerUp, ship);

    expect((ship as unknown as { shotPower: number }).shotPower).toBe(MAX_SHOT_POWER);
  });

  it('should increase ship.energy and ship.shotSpeed when a pill power-up is collected', () => {
    const ship = createMockShip({ shotSpeed: 1.5, energy: 8 });
    const powerUp = createMockPowerUp({ speed: 0.1, shot: 0, energy: 1 });

    objectService.triggerCallbacks(powerUp, ship);

    // eslint-disable-next-line no-magic-numbers
    expect((ship as unknown as { shotSpeed: number }).shotSpeed).toBeCloseTo(1.6);
    // eslint-disable-next-line no-magic-numbers
    expect((ship as unknown as { energy: number }).energy).toBe(9);
  });

  it('should NOT apply any power-up when collected by a non-ship object', () => {
    const enemy = {
      type: ObjectType.enemy,
      destroying: false,
      destroyed: false,
      reference: undefined,
      energy: 1,
      power: 1,
      shotSpeed: 0.2,
      shotPower: 1,
    } as unknown as ObjectModelType;
    const powerUp = createMockPowerUp({ speed: 0.1, shot: 1, energy: 0 });

    objectService.triggerCallbacks(powerUp, enemy);

    // eslint-disable-next-line no-magic-numbers
    expect((enemy as unknown as { shotSpeed: number }).shotSpeed).toBe(0.2);
    expect((enemy as unknown as { shotPower: number }).shotPower).toBe(1);
  });

  it('should NOT modify ship.shotPower when shot field is zero', () => {
    const ship = createMockShip({ shotPower: 1 });
    const powerUp = createMockPowerUp({ speed: 0.1, shot: 0, energy: 0 });

    objectService.triggerCallbacks(powerUp, ship);

    expect((ship as unknown as { shotPower: number }).shotPower).toBe(1);
  });

  it('should activate shield on the ship when a shield power-up is collected', () => {
    const ship = createMockShip({ shieldTicks: 0 });
    const powerUp = createMockPowerUp({ speed: 0, shot: 0, energy: 0, shield: SHIELD_DURATION_MS });

    objectService.triggerCallbacks(powerUp, ship);

    expect((ship as unknown as { shieldTicks: number }).shieldTicks).toBe(SHIELD_DURATION_MS);
  });

  it('should stack shield duration when a shield power-up is collected while already shielded', () => {
    const ship = createMockShip({ shieldTicks: SHIELD_DURATION_MS });
    const powerUp = createMockPowerUp({ speed: 0, shot: 0, energy: 0, shield: SHIELD_DURATION_MS });

    objectService.triggerCallbacks(powerUp, ship);

    // eslint-disable-next-line no-magic-numbers
    expect((ship as unknown as { shieldTicks: number }).shieldTicks).toBe(SHIELD_DURATION_MS * 2);
  });

  it('should NOT activate shield when the shield field is absent (regular power-up)', () => {
    const ship = createMockShip({ shieldTicks: 0 });
    const powerUp = createMockPowerUp({ speed: 0.1, shot: 0, energy: 0 });

    objectService.triggerCallbacks(powerUp, ship);

    expect((ship as unknown as { shieldTicks: number }).shieldTicks).toBe(0);
  });

  it('should NOT apply shield to a non-ship object', () => {
    const enemy = {
      type: ObjectType.enemy,
      destroying: false,
      destroyed: false,
      reference: undefined,
      energy: 1,
      power: 1,
      shieldTicks: 0,
    } as unknown as ObjectModelType;
    const powerUp = createMockPowerUp({ speed: 0, shot: 0, energy: 0, shield: SHIELD_DURATION_MS });

    objectService.triggerCallbacks(powerUp, enemy);

    expect((enemy as unknown as { shieldTicks: number }).shieldTicks).toBe(0);
  });

  describe('nuke power-up', () => {
    it('should explode all enemies when a nuke power-up is collected', () => {
      const ship = createMockShip();
      const nuke = createMockPowerUp({ speed: 0, shot: 0, energy: 0, nuke: true });
      const enemy1 = createMockEnemy();
      const enemy2 = createMockEnemy();
      objectService.add(enemy1 as never);
      objectService.add(enemy2 as never);

      objectService.triggerCallbacks(nuke, ship);

      expect((enemy1 as unknown as { explode: jasmine.Spy }).explode).toHaveBeenCalled();
      expect((enemy2 as unknown as { explode: jasmine.Spy }).explode).toHaveBeenCalled();
    });

    it('should explode all meteors when a nuke power-up is collected', () => {
      const ship = createMockShip();
      const nuke = createMockPowerUp({ speed: 0, shot: 0, energy: 0, nuke: true });
      const meteor1 = createMockMeteor();
      const meteor2 = createMockMeteor();
      objectService.add(meteor1 as never);
      objectService.add(meteor2 as never);

      objectService.triggerCallbacks(nuke, ship);

      expect((meteor1 as unknown as { explode: jasmine.Spy }).explode).toHaveBeenCalled();
      expect((meteor2 as unknown as { explode: jasmine.Spy }).explode).toHaveBeenCalled();
    });

    it('should NOT trigger nuke when collected by a non-ship object', () => {
      const enemy = {
        type: ObjectType.enemy,
        destroying: false,
        destroyed: false,
        reference: undefined,
        energy: 1,
        power: 1,
      } as unknown as ObjectModelType;
      const nuke = createMockPowerUp({ speed: 0, shot: 0, energy: 0, nuke: true });
      const targetEnemy = createMockEnemy();
      objectService.add(targetEnemy as never);

      objectService.triggerCallbacks(nuke, enemy);

      expect((targetEnemy as unknown as { explode: jasmine.Spy }).explode).not.toHaveBeenCalled();
    });

    it('should NOT explode nuke targets when nuke field is absent', () => {
      const ship = createMockShip();
      const powerUp = createMockPowerUp({ speed: 0.1, shot: 0, energy: 0 });
      const enemy = createMockEnemy();
      objectService.add(enemy as never);

      objectService.triggerCallbacks(powerUp, ship);

      expect((enemy as unknown as { explode: jasmine.Spy }).explode).not.toHaveBeenCalled();
    });

    it('should NOT explode enemies that are already destroying when nuke is collected', () => {
      const ship = createMockShip();
      const nuke = createMockPowerUp({ speed: 0, shot: 0, energy: 0, nuke: true });
      const destroyingEnemy: Record<string, unknown> = {
        type: ObjectType.enemy,
        destroying: true,
        destroyed: false,
        reference: undefined,
        energy: 0,
        power: 1,
        explode: jasmine.createSpy('explode'),
      };
      objectService.add(destroyingEnemy as never);

      objectService.triggerCallbacks(nuke, ship);

      expect((destroyingEnemy as unknown as { explode: jasmine.Spy }).explode).not.toHaveBeenCalled();
    });

    it('should NOT explode enemies that are already destroyed when nuke is collected', () => {
      const ship = createMockShip();
      const nuke = createMockPowerUp({ speed: 0, shot: 0, energy: 0, nuke: true });
      const destroyedEnemy: Record<string, unknown> = {
        type: ObjectType.enemy,
        destroying: false,
        destroyed: true,
        reference: undefined,
        energy: 0,
        power: 1,
        explode: jasmine.createSpy('explode'),
      };
      objectService.add(destroyedEnemy as never);

      objectService.triggerCallbacks(nuke, ship);

      expect((destroyedEnemy as unknown as { explode: jasmine.Spy }).explode).not.toHaveBeenCalled();
    });
  });
});

describe('GameCollectableService - update (off-screen cleanup)', () => {
  let objectService: ObjectService;
  let collectableService: GameCollectableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectService,
        GameCollectableService,
        {
          provide: ApplicationService,
          useValue: buildApplicationServiceMock(),
        },
        {
          provide: AchievementService,
          useValue: {
            checkMilestone: jasmine.createSpy('checkMilestone'),
          },
        },
        {
          provide: GameShotService,
          useValue: {
            fireOrbitalStrike: jasmine.createSpy('fireOrbitalStrike'),
          },
        },
      ],
    });

    objectService = TestBed.inject(ObjectService);
    collectableService = TestBed.inject(GameCollectableService);
  });

  function createMockCollectable(y: number): ObjectModelType {
    const collectable: Record<string, unknown> = {
      type: ObjectType.collectable,
      destroying: false,
      destroyed: false,
      reference: undefined,
      energy: 0,
      power: 0,
      y,
      destroy: jasmine.createSpy('destroy').and.callFake(() => {
        collectable['destroyed'] = true;
      }),
    };
    return collectable as unknown as ObjectModelType;
  }

  it('should destroy a collectable that has fallen below the screen (y > screenHeight + OFF_SCREEN_BUFFER)', () => {
    const collectable = createMockCollectable(MOCK_SCREEN_HEIGHT + OFF_SCREEN_BUFFER + 1);
    objectService.add(collectable as never);

    collectableService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((collectable as any).destroy).toHaveBeenCalled();
  });

  it('should NOT destroy a collectable that is still on-screen', () => {
    // eslint-disable-next-line no-magic-numbers
    const collectable = createMockCollectable(300);
    objectService.add(collectable as never);

    collectableService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((collectable as any).destroy).not.toHaveBeenCalled();
  });

  it('should NOT destroy a collectable exactly at the boundary (y === screenHeight + OFF_SCREEN_BUFFER)', () => {
    const collectable = createMockCollectable(MOCK_SCREEN_HEIGHT + OFF_SCREEN_BUFFER);
    objectService.add(collectable as never);

    collectableService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((collectable as any).destroy).not.toHaveBeenCalled();
  });

  it('should destroy all off-screen collectables and leave on-screen ones intact', () => {
    const offScreen = createMockCollectable(MOCK_SCREEN_HEIGHT + OFF_SCREEN_BUFFER + 1);
    // eslint-disable-next-line no-magic-numbers
    const onScreen = createMockCollectable(400);
    objectService.add(offScreen as never);
    objectService.add(onScreen as never);

    collectableService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((offScreen as any).destroy).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((onScreen as any).destroy).not.toHaveBeenCalled();
  });
});

