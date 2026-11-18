import { FederatedEvent, FederatedPointerEvent } from 'pixi.js';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';

// the ship may only move within the lower third, so dodging gets more room without flying into enemies
const MOVE_AREA_TOP_RATIO = 0.66;
const MOVE_AREA_BOTTOM_MARGIN = 40;
// keep the ship visible above the finger on touch screens
const TOUCH_OFFSET_Y = 60;

export interface EventData {
  data: { originalEvent: PointerEvent | TouchEvent };
}

export function handleMouseMove(
  event: FederatedPointerEvent,
  ship: AnimatedGameSprite | undefined,
  screenHeight: number,
): void {
  if (!ship || ship.destroyed) {
    return;
  }

  const relevantEvent = event.originalEvent;
  const isTouch = !isPointerEvent(relevantEvent) || relevantEvent.pointerType === 'touch';
  const point = isPointerEvent(relevantEvent)
    ? relevantEvent
    : (event.originalEvent as unknown as TouchEvent).touches[0];
  ship.targetX = point.clientX;
  ship.targetY = clampShipY(point.clientY - (isTouch ? TOUCH_OFFSET_Y : 0), screenHeight);
}

export function clampShipY(y: number, screenHeight: number): number {
  return Math.min(Math.max(y, screenHeight * MOVE_AREA_TOP_RATIO), screenHeight - MOVE_AREA_BOTTOM_MARGIN);
}

export function isPointerEvent(
  event: PointerEvent | TouchEvent | FederatedEvent,
): event is PointerEvent {
  return (event as any).clientX !== undefined;
}

/* eslint-disable @typescript-eslint/naming-convention, no-magic-numbers -- KeyboardEvent.code names */
const KEY_DIRECTIONS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
};
/* eslint-enable @typescript-eslint/naming-convention, no-magic-numbers */

export function isMovementKey(code: string): boolean {
  return code in KEY_DIRECTIONS;
}

/** Sum of the held movement keys (KeyboardEvent.code), each axis -1, 0 or 1. */
export function getKeyboardDirection(pressed: ReadonlySet<string>): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const code of pressed) {
    const direction = KEY_DIRECTIONS[code] as readonly [number, number] | undefined;
    if (direction) {
      x += direction[0];
      y += direction[1];
    }
  }
  return { x: Math.sign(x), y: Math.sign(y) };
}
