/* eslint-disable no-magic-numbers */
import { clampShipY } from './mouse.util';

describe('clampShipY', () => {
  it('keeps the ship inside the lower third of the screen', () => {
    expect(clampShipY(0, 900)).toBe(594);
    expect(clampShipY(700, 900)).toBe(700);
    expect(clampShipY(900, 900)).toBe(860);
  });
});
