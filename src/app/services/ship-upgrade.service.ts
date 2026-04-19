import { inject, Injectable, signal } from '@angular/core';
import { Ship } from '../models/pixijs/ship';
import {
  DEFAULT_SHIP_UPGRADE_LEVELS,
  SHIP_UPGRADE_DEFINITIONS,
  ShipUpgradeDefinition,
  ShipUpgradeLevels,
  ShipUpgradeType,
} from '../models/ship-upgrade.model';
import { StorageService } from './storage.service';

interface ShipUpgradeBonusSummary {
  energy: number;
  shotPower: number;
  shotSpeed: number;
}

@Injectable()
export class ShipUpgradeService {
  readonly definitions = SHIP_UPGRADE_DEFINITIONS;

  private readonly storage = inject(StorageService);
  private readonly levels = signal<ShipUpgradeLevels>({ ...DEFAULT_SHIP_UPGRADE_LEVELS });
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const storedLevels = await this.storage.getShipUpgrades();
    this.levels.set({ ...DEFAULT_SHIP_UPGRADE_LEVELS, ...storedLevels });
    this.initialized = true;
  }

  getLevel(type: ShipUpgradeType): number {
    return this.levels()[type];
  }

  getUpgradeCost(type: ShipUpgradeType): number | null {
    const definition = this.getDefinition(type);
    const level = this.getLevel(type);

    if (level >= definition.maxLevel) {
      return null;
    }

    const cost = definition.baseCost * definition.costMultiplier ** level;
    return Math.ceil(cost);
  }

  async levelUp(type: ShipUpgradeType): Promise<boolean> {
    const definition = this.getDefinition(type);
    const level = this.getLevel(type);

    if (level >= definition.maxLevel) {
      return false;
    }

    this.levels.update((current) => ({
      ...current,
      [type]: level + 1,
    }));

    await this.storage.setShipUpgrades({ ...this.levels() });

    return true;
  }

  applyToShip(ship: Ship): void {
    const bonus = this.getBonusSummary(ship.shipType);

    ship.maxEnergy = ship.baseMaxEnergy + bonus.energy;
    ship.energy = Math.min(ship.energy, ship.maxEnergy);
    ship.shotPower = ship.baseShotPower + bonus.shotPower;
    ship.shotSpeed = ship.baseShotSpeed + bonus.shotSpeed;
  }

  private getBonusSummary(shipType: Ship['shipType']): ShipUpgradeBonusSummary {
    const summary: ShipUpgradeBonusSummary = {
      energy: 0,
      shotPower: 0,
      shotSpeed: 0,
    };

    for (const definition of this.definitions) {
      if (definition.appliesTo !== shipType) {
        continue;
      }

      const level = this.getLevel(definition.type);
      summary.energy += (definition.bonusPerLevel.energy ?? 0) * level;
      summary.shotPower += (definition.bonusPerLevel.shotPower ?? 0) * level;
      summary.shotSpeed += (definition.bonusPerLevel.shotSpeed ?? 0) * level;
    }

    return summary;
  }

  private getDefinition(type: ShipUpgradeType): ShipUpgradeDefinition {
    const definition = this.definitions.find((item) => item.type === type);

    if (!definition) {
      throw new Error(`Unknown ship upgrade: ${type}`);
    }

    return definition;
  }
}
