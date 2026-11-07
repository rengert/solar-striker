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
