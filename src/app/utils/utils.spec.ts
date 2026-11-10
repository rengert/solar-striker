/* eslint-disable no-magic-numbers */
import { rollSpawn } from './utils';

function countSpawns(fps: number, intervalFrames: number): number {
  const deltaMS = 1000 / fps;
  let spawns = 0;
  // ten seconds with evenly spread rolls instead of real randomness
  const frames = fps * 10;
  for (let i = 0; i < frames; i++) {
    spawns += rollSpawn(deltaMS, intervalFrames, (i + 0.5) / frames) ? 1 : 0;
  }
  return spawns;
}

describe('rollSpawn', () => {
  it('spawns as often at 120 fps as at 60 fps', () => {
    // 120 frames at 60 fps = one spawn every 2 s, so 5 in 10 s
    expect(countSpawns(60, 120)).toBe(5);
    expect(countSpawns(120, 120)).toBe(5);
    expect(countSpawns(30, 120)).toBe(5);
  });

  it('spawns every frame at 60 fps once the interval is a single frame', () => {
    expect(rollSpawn(1000 / 60, 1, 0.999)).toBeTrue();
  });
});
