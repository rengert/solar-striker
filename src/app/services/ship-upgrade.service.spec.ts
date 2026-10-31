import { TestBed } from '@angular/core/testing';
import { MAX_SHOT_POWER } from '../game-constants';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { ShipUpgradeType } from '../models/ship-upgrade.model';
import { ShipUpgradeService } from './ship-upgrade.service';
import { StorageService } from './storage.service';

describe('ShipUpgradeService', () => {
  it('caps shot power at MAX_SHOT_POWER when cannons and warhead are fully upgraded', async () => {
    TestBed.configureTestingModule({
      providers: [
        ShipUpgradeService,
        {
          provide: StorageService,
          useValue: {
            getShipUpgrades: (): Promise<Record<string, number>> => Promise.resolve({ [ShipUpgradeType.cannons]: 6, [ShipUpgradeType.warhead]: 5 }),
          },
        },
      ],
    });
    const service = TestBed.inject(ShipUpgradeService);
    await service.init();
    const ship = {
      shipType: ShipType.ship, baseShotPower: 2, baseShotSpeed: 1, baseMaxEnergy: 5, maxEnergy: 5, energy: 5,
    } as unknown as Ship;

    service.applyToShip(ship);

    expect(ship.shotPower).toBe(MAX_SHOT_POWER);
  });
});
