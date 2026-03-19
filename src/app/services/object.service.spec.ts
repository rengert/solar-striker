import { TestBed } from '@angular/core/testing';
import { ObjectModelType, ObjectService } from './object.service';
import { ApplicationService } from './application.service';
import { ObjectType } from '../models/pixijs/object-type.enum';

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

describe('ObjectService', () => {
  let service: ObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectService,
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
    service = TestBed.inject(ObjectService);
  });

  describe('add', () => {
    it('should make added enemies visible in enemies() computed signal', () => {
      const enemy = createMockObject(ObjectType.enemy);

      expect(service.enemies().length).toBe(0);

      service.add(enemy as never);

      expect(service.enemies().length).toBe(1);
      expect(service.enemies()[0]).toBe(enemy);
    });

    it('should make added objects visible in objects() computed signal', () => {
      const rocket = createMockObject(ObjectType.rocket);

      expect(service.objects().length).toBe(0);

      service.add(rocket as never);

      expect(service.objects().length).toBe(1);
    });

    it('should make added meteors visible in meteors() computed signal', () => {
      const meteor = createMockObject(ObjectType.meteor);

      expect(service.meteors().length).toBe(0);

      service.add(meteor as never);

      expect(service.meteors().length).toBe(1);
    });

    it('should make added rockets visible in rockets() computed signal', () => {
      const rocket = createMockObject(ObjectType.rocket);

      expect(service.rockets().length).toBe(0);

      service.add(rocket as never);

      expect(service.rockets().length).toBe(1);
    });

    it('should make added collectables visible in collectables() computed signal', () => {
      const collectable = createMockObject(ObjectType.collectable);

      expect(service.collectables().length).toBe(0);

      service.add(collectable as never);

      expect(service.collectables().length).toBe(1);
    });

    it('should accumulate multiple added objects', () => {
      service.add(createMockObject(ObjectType.enemy) as never);
      service.add(createMockObject(ObjectType.enemy) as never);
      service.add(createMockObject(ObjectType.rocket) as never);

      // eslint-disable-next-line no-magic-numbers
      expect(service.enemies().length).toBe(2);
      // eslint-disable-next-line no-magic-numbers
      expect(service.objects().length).toBe(3);
    });
  });

  describe('onDestroyed / triggerCallbacks', () => {
    it('should fire registered callbacks when the object is destroying', () => {
      const callback = jasmine.createSpy('callback');
      service.onDestroyed(ObjectType.enemy, callback);

      const enemy = createMockObject(ObjectType.enemy, { destroying: true });
      const killer = createMockObject(ObjectType.rocket);

      service.triggerCallbacks(enemy, killer);

      expect(callback).toHaveBeenCalledOnceWith(enemy, killer);
    });

    it('should NOT fire callbacks when the object is not destroying', () => {
      const callback = jasmine.createSpy('callback');
      service.onDestroyed(ObjectType.enemy, callback);

      const enemy = createMockObject(ObjectType.enemy, { destroying: false });
      const killer = createMockObject(ObjectType.rocket);

      service.triggerCallbacks(enemy, killer);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should fire multiple registered callbacks for the same type', () => {
      const callback1 = jasmine.createSpy('callback1');
      const callback2 = jasmine.createSpy('callback2');
      service.onDestroyed(ObjectType.enemy, callback1);
      service.onDestroyed(ObjectType.enemy, callback2);

      const enemy = createMockObject(ObjectType.enemy, { destroying: true });
      const killer = createMockObject(ObjectType.rocket);

      service.triggerCallbacks(enemy, killer);

      expect(callback1).toHaveBeenCalledOnceWith(enemy, killer);
      expect(callback2).toHaveBeenCalledOnceWith(enemy, killer);
    });

    it('should NOT fire callbacks for a different object type', () => {
      const callback = jasmine.createSpy('callback');
      service.onDestroyed(ObjectType.meteor, callback);

      const enemy = createMockObject(ObjectType.enemy, { destroying: true });
      const killer = createMockObject(ObjectType.rocket);

      service.triggerCallbacks(enemy, killer);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('kill counting logic (via onDestroyed callback)', () => {
    it('should count a kill when an enemy is destroyed by a player rocket', () => {
      let killCount = 0;
      service.onDestroyed(ObjectType.enemy, (_, by) => {
        if (by.type === ObjectType.ship || by.reference?.type === ObjectType.ship) {
          killCount++;
        }
      });

      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });
      const enemy = createMockObject(ObjectType.enemy, { destroying: true });

      service.triggerCallbacks(enemy, playerRocket);

      expect(killCount).toBe(1);
    });

    it('should count a kill when an enemy is destroyed by the player ship directly', () => {
      let killCount = 0;
      service.onDestroyed(ObjectType.enemy, (_, by) => {
        if (by.type === ObjectType.ship || by.reference?.type === ObjectType.ship) {
          killCount++;
        }
      });

      const playerShip = createMockObject(ObjectType.ship);
      const enemy = createMockObject(ObjectType.enemy, { destroying: true });

      service.triggerCallbacks(enemy, playerShip);

      expect(killCount).toBe(1);
    });

    it('should NOT count a kill when an enemy is destroyed by an enemy rocket', () => {
      let killCount = 0;
      service.onDestroyed(ObjectType.enemy, (_, by) => {
        if (by.type === ObjectType.ship || by.reference?.type === ObjectType.ship) {
          killCount++;
        }
      });

      const enemyShip = createMockObject(ObjectType.enemy);
      const enemyRocket = createMockObject(ObjectType.rocket, { reference: enemyShip });
      const targetEnemy = createMockObject(ObjectType.enemy, { destroying: true });

      service.triggerCallbacks(targetEnemy, enemyRocket);

      expect(killCount).toBe(0);
    });

    it('should NOT count a kill when an enemy is destroyed by a meteor', () => {
      let killCount = 0;
      service.onDestroyed(ObjectType.enemy, (_, by) => {
        if (by.type === ObjectType.ship || by.reference?.type === ObjectType.ship) {
          killCount++;
        }
      });

      const meteor = createMockObject(ObjectType.meteor);
      const enemy = createMockObject(ObjectType.enemy, { destroying: true });

      service.triggerCallbacks(enemy, meteor);

      expect(killCount).toBe(0);
    });

    it('should count multiple kills for multiple enemy destructions', () => {
      let killCount = 0;
      service.onDestroyed(ObjectType.enemy, (_, by) => {
        if (by.type === ObjectType.ship || by.reference?.type === ObjectType.ship) {
          killCount++;
        }
      });

      const playerShip = createMockObject(ObjectType.ship);
      const playerRocket = createMockObject(ObjectType.rocket, { reference: playerShip });

      const enemy1 = createMockObject(ObjectType.enemy, { destroying: true });
      const enemy2 = createMockObject(ObjectType.enemy, { destroying: true });
      const enemy3 = createMockObject(ObjectType.enemy, { destroying: true });

      service.triggerCallbacks(enemy1, playerRocket);
      service.triggerCallbacks(enemy2, playerShip);
      service.triggerCallbacks(enemy3, playerRocket);

      // eslint-disable-next-line no-magic-numbers
      expect(killCount).toBe(3);
    });
  });

  describe('update', () => {
    it('should retain objects added via callbacks triggered during collision detection', () => {
      let spawnedCollectable: ObjectModelType | null = null;

      service.onDestroyed(ObjectType.enemy, (_, by) => {
        if (by.type === ObjectType.ship || by.reference?.type === ObjectType.ship) {
          const collectable = createMockObject(ObjectType.collectable, {
            destroy: () => {
              collectable.destroyed = true;
            },
          });
          service.add(collectable as never);
          spawnedCollectable = collectable;
        }
      });

      const playerShip = createMockObject(ObjectType.ship);
      const rocket = createMockObject(ObjectType.rocket, {
        reference: playerShip,
        hit: (other: ObjectModelType) => {
          if (other === enemy) {
            enemy.destroying = true;
          }
          return other === enemy;
        },
      });
      const enemy = createMockObject(ObjectType.enemy, {
        destroy: () => {
          enemy.destroyed = true;
        },
      });

      service.add(rocket as never);
      service.add(enemy as never);

      const mockTicker = { deltaMS: 16 } as never;
      service.update(mockTicker);

      expect(spawnedCollectable).not.toBeNull();
      expect(service.objects()).toContain(spawnedCollectable!);
    });
  });
});
