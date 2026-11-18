/* eslint-disable no-magic-numbers */
import { clampShipY, getKeyboardDirection } from './mouse.util';

describe('clampShipY', () => {
  it('keeps the ship inside the lower third of the screen', () => {
    expect(clampShipY(0, 900)).toBe(594);
    expect(clampShipY(700, 900)).toBe(700);
    expect(clampShipY(900, 900)).toBe(860);
  });
});

describe('getKeyboardDirection', () => {
  it('combines arrows and WASD and cancels opposite keys', () => {
    expect(getKeyboardDirection(new Set())).toEqual({ x: 0, y: 0 });
    expect(getKeyboardDirection(new Set(['ArrowLeft', 'KeyW']))).toEqual({ x: -1, y: -1 });
    expect(getKeyboardDirection(new Set(['ArrowLeft', 'KeyD']))).toEqual({ x: 0, y: 0 });
    expect(getKeyboardDirection(new Set(['ArrowRight', 'KeyD', 'Space']))).toEqual({ x: 1, y: 0 });
  });
});
