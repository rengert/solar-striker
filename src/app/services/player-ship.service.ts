import { inject, Injectable, signal } from '@angular/core';
import {
  DEFAULT_PLAYER_SHIP_CLASS,
  PLAYER_SHIP_DEFINITIONS,
  PlayerShipClass,
  PlayerShipDefinition,
} from '../models/player-ship-class.model';
import { Ship } from '../models/pixijs/ship';
import { ShipClassSelectionState, StorageService } from './storage.service';

@Injectable()
export class PlayerShipService {
  readonly definitions = PLAYER_SHIP_DEFINITIONS;

  private readonly storage = inject(StorageService);
  private readonly selectedClass = signal<PlayerShipClass>(DEFAULT_PLAYER_SHIP_CLASS);
  private readonly unlockedClasses = signal<Set<PlayerShipClass>>(
    new Set([DEFAULT_PLAYER_SHIP_CLASS]),
  );
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const state = await this.storage.getShipClassSelection();

    if (state) {
      this.selectedClass.set(state.selected);
      this.unlockedClasses.set(new Set(state.unlocked));
    }

    this.initialized = true;
  }

  getSelectedClass(): PlayerShipClass {
    return this.selectedClass();
  }

  isUnlocked(cls: PlayerShipClass): boolean {
    return this.unlockedClasses().has(cls);
  }

  async selectClass(cls: PlayerShipClass): Promise<void> {
    if (!this.isUnlocked(cls)) {
      return;
    }

    this.selectedClass.set(cls);
    await this.saveState();
  }

  async unlock(cls: PlayerShipClass): Promise<void> {
    const unlocked = new Set(this.unlockedClasses());

    unlocked.add(cls);
    this.unlockedClasses.set(unlocked);
    await this.saveState();
  }

  getDefinition(cls: PlayerShipClass): PlayerShipDefinition {
    const definition = this.definitions.find((d) => d.type === cls);

    if (!definition) {
      throw new Error(`Unknown ship class: ${cls}`);
    }

    return definition;
  }

  getSelectedDefinition(): PlayerShipDefinition {
    return this.getDefinition(this.selectedClass());
  }

  applyToShip(ship: Ship): void {
    const definition = this.getSelectedDefinition();

    ship.tint = definition.tint;
    ship.rocketSpeed = definition.rocketSpeed;
    ship.xSpeed = definition.xSpeed;
    ship.baseMaxEnergy = definition.energy;
    ship.baseShotSpeed = definition.shotSpeed;
    ship.baseShotPower = definition.shotPower;
    ship.maxEnergy = definition.energy;
    ship.energy = definition.energy;
    ship.shotSpeed = definition.shotSpeed;
    ship.shotPower = definition.shotPower;
  }

  private async saveState(): Promise<void> {
    const state: ShipClassSelectionState = {
      selected: this.selectedClass(),
      unlocked: [...this.unlockedClasses()],
    };

    await this.storage.setShipClassSelection(state);
  }
}
