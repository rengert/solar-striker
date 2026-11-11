import { ObjectType } from '../models/pixijs/object-type.enum';

export function filterBy(type: ObjectType): (object: { type: ObjectType }) => boolean {
  return (object: { type: ObjectType }) => object.type === type;
}

// spawn intervals were tuned as frames at 60 fps
// eslint-disable-next-line no-magic-numbers
const FRAME_MS_AT_60_FPS = 1000 / 60;

/** Random spawn roll with on average one hit per `intervalFrames` 60 fps frames, independent of the real frame rate. */
export function rollSpawn(deltaMS: number, intervalFrames: number, random = Math.random()): boolean {
  return random < deltaMS / (intervalFrames * FRAME_MS_AT_60_FPS);
}
