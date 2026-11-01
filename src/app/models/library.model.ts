import { PowerUp } from './pixijs/power-up-sprite';

export interface LibraryEnemy {
  readonly id: 'fighter' | 'orbiter' | 'meteor' | 'sweeper' | 'bossOrbiter' | 'hunter';
  readonly icon: string;
}

/** Codex order of power-ups; every PowerUp must be listed so new ones show up in the library. */
export const LIBRARY_POWER_UPS: readonly PowerUp[] = Object.values(PowerUp);

export const LIBRARY_ENEMIES: readonly LibraryEnemy[] = [
  { id: 'fighter', icon: '🛸' },
  { id: 'orbiter', icon: '🌀' },
  { id: 'meteor', icon: '☄️' },
  { id: 'sweeper', icon: '👹' },
  { id: 'bossOrbiter', icon: '👁️' },
  { id: 'hunter', icon: '🎯' },
];
