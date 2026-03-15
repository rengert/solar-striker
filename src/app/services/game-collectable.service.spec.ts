import { TestBed } from '@angular/core/testing';
import { ObjectModelType, ObjectService } from './object.service';
import { ApplicationService } from './application.service';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { GameCollectableService } from './game-collectable.service';

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
    ...overrides,
  } as unknown as ObjectModelType;
}

function createMockPowerUp(powerUpConfig: {
  speed: number;
  shot: number;
  energy: number;
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

describe('GameCollectableService - collectPowerUp', () => {
  let objectService: ObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectService,
        GameCollectableService,
        {
          provide: ApplicationService,
          useValue: {
            stage: { addChild: jasmine.createSpy('addChild') },
            ticker: {
              add: jasmine.createSpy('add'),
              remove: jasmine.createSpy('remove'),
            },
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

    expect((ship as unknown as { shotPower: number }).shotPower).toBe(2);
  });

  it('should increase ship.energy and ship.shotSpeed when a pill power-up is collected', () => {
    const ship = createMockShip({ shotSpeed: 1.5, energy: 8 });
    const powerUp = createMockPowerUp({ speed: 0.1, shot: 0, energy: 1 });

    objectService.triggerCallbacks(powerUp, ship);

    // eslint-disable-next-line no-magic-numbers
    expect((ship as unknown as { shotSpeed: number }).shotSpeed).toBeCloseTo(1.6);
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

    expect((enemy as unknown as { shotSpeed: number }).shotSpeed).toBe(0.2);
    expect((enemy as unknown as { shotPower: number }).shotPower).toBe(1);
  });

  it('should NOT modify ship.shotPower when shot field is zero', () => {
    const ship = createMockShip({ shotPower: 1 });
    const powerUp = createMockPowerUp({ speed: 0.1, shot: 0, energy: 0 });

    objectService.triggerCallbacks(powerUp, ship);

    expect((ship as unknown as { shotPower: number }).shotPower).toBe(1);
  });
});
