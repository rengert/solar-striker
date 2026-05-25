import { inject, Injectable } from '@angular/core';
import {
  DailyChallengeDefinition,
  DailyChallengeState,
  DailyChallengeType,
  getDailyChallenges,
  getDayIndex,
  getTodayDateKey,
} from '../models/daily-challenge.model';
import { StorageService } from './storage.service';

export interface DailyChallengeEntry {
  def: DailyChallengeDefinition;
  progress: number;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class DailyChallengeService {
  private readonly storage = inject(StorageService);

  private todayKey = '';
  private today: DailyChallengeDefinition[] = [];
  private state: DailyChallengeState = { date: '', progress: {}, completed: {} };

  /** Called when a challenge is completed; wired by GameService */
  onCompleted?: (challenge: DailyChallengeDefinition) => void;

  async init(): Promise<void> {
    this.todayKey = getTodayDateKey();
    const savedState = await this.storage.getDailyChallenges();

    if (savedState?.date === this.todayKey) {
      this.state = savedState;
    } else {
      this.state = { date: this.todayKey, progress: {}, completed: {} };
      await this.storage.setDailyChallenges(this.state);
    }

    this.today = getDailyChallenges(getDayIndex(this.todayKey));
  }

  getToday(): DailyChallengeEntry[] {
    return this.today.map((def) => ({
      def,
      progress: this.state.progress[def.id] ?? 0,
      completed: this.state.completed[def.id] ?? false,
    }));
  }

  /** Increment cumulative daily kill count. */
  addKills(count: number): void {
    this.addProgressForType('kills', count);
  }

  /** Track highest combo reached in any session today. */
  checkCombo(combo: number): void {
    this.updateMaxForType('combo', combo);
  }

  /** Track highest level reached in any session today. */
  checkLevel(level: number): void {
    this.updateMaxForType('level', level);
  }

  /** Increment cumulative daily coins earned. */
  addCoins(amount: number): void {
    this.addProgressForType('coins', amount);
  }

  /** Increment cumulative daily boss defeats. */
  addBoss(): void {
    this.addProgressForType('boss', 1);
  }

  private addProgressForType(type: DailyChallengeType, amount: number): void {
    let changed = false;
    for (const def of this.today) {
      if (def.type === type && !(this.state.completed[def.id] ?? false)) {
        const prev = this.state.progress[def.id] ?? 0;
        this.state.progress[def.id] = prev + amount;
        changed = true;
        this.checkThreshold(def);
      }
    }
    if (changed) {
      void this.storage.setDailyChallenges(this.state);
    }
  }

  private updateMaxForType(type: DailyChallengeType, value: number): void {
    let changed = false;
    for (const def of this.today) {
      if (def.type === type && !(this.state.completed[def.id] ?? false)) {
        const prev = this.state.progress[def.id] ?? 0;
        if (value > prev) {
          this.state.progress[def.id] = value;
          changed = true;
          this.checkThreshold(def);
        }
      }
    }
    if (changed) {
      void this.storage.setDailyChallenges(this.state);
    }
  }

  private checkThreshold(def: DailyChallengeDefinition): void {
    const progress = this.state.progress[def.id] ?? 0;
    if (progress >= def.threshold && !(this.state.completed[def.id] ?? false)) {
      this.state.completed[def.id] = true;
      this.onCompleted?.(def);
    }
  }
}
