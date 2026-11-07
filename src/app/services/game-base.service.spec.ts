import { TestBed } from '@angular/core/testing';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';
import { BASE_MAX_ENERGY, GameBaseService } from './game-base.service';

describe('GameBaseService', () => {
  let service: GameBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameBaseService,
        // eslint-disable-next-line no-magic-numbers
        { provide: ApplicationService, useValue: { screen: { width: 400, height: 600 } } },
        { provide: ExplosionService, useValue: { explode: jasmine.createSpy('explode').and.returnValue(Promise.resolve()) } },
      ],
    });
    service = TestBed.inject(GameBaseService);
  });

  it('loses one energy per strike, never drops below zero and is fully repaired again', () => {
    for (let i = 0; i <= BASE_MAX_ENERGY; i++) {
      service.attack(0);
    }
    expect(service.energy()).toBe(0);

    service.repair();
    expect(service.energy()).toBe(BASE_MAX_ENERGY);
  });

  it('places the surface at the bottom corners and highest in the middle', () => {
    // eslint-disable-next-line no-magic-numbers
    expect(service.getSurfaceY(0)).toBe(600);
    // eslint-disable-next-line no-magic-numbers
    expect(service.getSurfaceY(200)).toBeLessThan(service.getSurfaceY(100));
  });
});
