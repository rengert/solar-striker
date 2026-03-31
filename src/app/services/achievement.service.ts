import { inject, Injectable } from '@angular/core';
import {
  AchievementDefinition,
  AchievementId,
  AchievementState,
  ACHIEVEMENTS,
} from '../models/achievement.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly storage = inject(StorageService);

  private readonly states = new Map<AchievementId, AchievementState>();

  /** Called when an achievement is unlocked; wired by GameService */
  onUnlocked?: (definition: AchievementDefinition) => void;

  async init(): Promise<void> {
    const saved = await this.storage.getAchievements();

    for (const def of ACHIEVEMENTS) {
      const savedState = saved.find((s) => s.id === def.id);
      this.states.set(def.id, savedState ?? { id: def.id, progress: 0, unlocked: false });
    }
  }

  getAll(): AchievementState[] {
    return ACHIEVEMENTS.map((def) => this.states.get(def.id) ?? { id: def.id, progress: 0, unlocked: false });
  }

  getDefinition(id: AchievementId): AchievementDefinition | undefined {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }

  /** Track cumulative progress (accumulates across game sessions). */
  addCumulative(id: AchievementId, increment: number): void {
    const state = this.states.get(id);
    const def = ACHIEVEMENTS.find((a) => a.id === id);

    if (!state || !def || state.unlocked) {
      return;
    }

    state.progress += increment;

    if (state.progress >= def.threshold) {
      this.unlock(state, def);
    }
  }

  /** Check single-game milestone (unlocks if currentValue meets threshold). */
  checkMilestone(id: AchievementId, currentValue: number): void {
    const state = this.states.get(id);
    const def = ACHIEVEMENTS.find((a) => a.id === id);

    if (!state || !def || state.unlocked) {
      return;
    }

    if (currentValue >= def.threshold) {
      state.progress = def.threshold;
      this.unlock(state, def);
    }
  }

  private unlock(state: AchievementState, def: AchievementDefinition): void {
    state.unlocked = true;
    state.unlockedAt = new Date().toISOString();
    void this.storage.setAchievements(this.getAll());
    this.onUnlocked?.(def);
  }
}
