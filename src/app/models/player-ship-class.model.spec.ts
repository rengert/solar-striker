import { MAX_SHOT_POWER } from '../game-constants';
import { PLAYER_SHIP_DEFINITIONS, PlayerShipClass } from './player-ship-class.model';

// two rows of three cards in the hangar
const HANGAR_SHIP_SLOTS = 6;

describe('PLAYER_SHIP_DEFINITIONS', () => {
  it('defines every ship class exactly once', () => {
    expect(PLAYER_SHIP_DEFINITIONS.map((d) => d.type).sort()).toEqual(
      Object.values(PlayerShipClass).sort(),
    );
  });

  it('fits the hangar grid of two rows with three cards', () => {
    expect(PLAYER_SHIP_DEFINITIONS.length).toBeLessThanOrEqual(HANGAR_SHIP_SLOTS);
  });

  it('keeps shot power inside the shot pattern', () => {
    for (const definition of PLAYER_SHIP_DEFINITIONS) {
      expect(definition.shotPower).toBeLessThanOrEqual(MAX_SHOT_POWER);
    }
  });
});
