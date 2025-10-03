import { FederatedEvent, FederatedPointerEvent } from 'pixi.js';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';

export interface EventData {
  data: { originalEvent: PointerEvent | TouchEvent };
}

export function handleMouseMove(
  event: FederatedPointerEvent,
  ship: AnimatedGameSprite | undefined,
): void {
  if (!ship || ship.destroyed) {
    return;
  }

  const relevantEvent = event.originalEvent;
  ship.targetX = isPointerEvent(relevantEvent)
    ? relevantEvent.clientX
    : (event.originalEvent as unknown as TouchEvent).touches[0].clientX;
}

export function isPointerEvent(
  event: PointerEvent | TouchEvent | FederatedEvent,
): event is PointerEvent {
  return (event as any).clientX !== undefined;
}
