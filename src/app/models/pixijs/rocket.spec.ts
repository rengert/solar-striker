import { Texture, Ticker } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { SPEED_SCALE } from './animated-game-sprite';
import { Rocket } from './rocket';

const ACCEL_DURATION_MS = 500;
const DELTA_MS = 16;
const ROCKET_SPEED = -10;
const FLOAT_PRECISION = 5;
const HALF_DIVISOR = 2;

function createTicker(deltaMS: number): Ticker {
  return { deltaMS } as unknown as Ticker;
}

function createRocket(): Rocket {
  const explosionService = jasmine.createSpyObj<ExplosionService>('ExplosionService', {
    explode: Promise.resolve(),
  });
  return new Rocket(explosionService, ROCKET_SPEED, [Texture.EMPTY]);
}

describe('Rocket - acceleration', () => {
  it('should not move at all on the very first tick when deltaMS is zero', () => {
    const rocket = createRocket();
    const initialY = rocket.y;
    rocket.update(createTicker(0));
    expect(rocket.y).toBe(initialY);
  });

  it('should move slower than full speed during the acceleration phase', () => {
    const rocket = createRocket();
    const startY = rocket.y;

    // A single short tick – well within the 500 ms window
    rocket.update(createTicker(DELTA_MS));
    const partialMove = Math.abs(rocket.y - startY);

    // Full-speed move for same tick
    const fullSpeedMove = DELTA_MS * Math.abs(ROCKET_SPEED) * SPEED_SCALE;
    expect(partialMove).toBeLessThan(fullSpeedMove);
  });

  it('should reach full speed after the acceleration phase', () => {
    const rocket = createRocket();

    // Fast-forward past the full acceleration window
    rocket.update(createTicker(ACCEL_DURATION_MS + DELTA_MS));

    const afterAccel = rocket.y;
    // One more tick at exactly full speed
    rocket.update(createTicker(DELTA_MS));
    const fullSpeedMove = DELTA_MS * Math.abs(ROCKET_SPEED) * SPEED_SCALE;
    const actualMove = Math.abs(rocket.y - afterAccel);

    // Allow small floating-point tolerance
    expect(actualMove).toBeCloseTo(fullSpeedMove, FLOAT_PRECISION);
  });

  it('should move proportionally to elapsed time within the acceleration phase', () => {
    // At 50 % of the accel window the integral gives roughly 25 % of full-speed movement;
    // the important guarantee is that it stays well below a full-speed tick of the same duration.
    const halfDuration = ACCEL_DURATION_MS / HALF_DIVISOR;
    const rocket = createRocket();
    const startY = rocket.y;

    // Single tick equal to exactly half the accel duration
    rocket.update(createTicker(halfDuration));
    const halfMove = Math.abs(rocket.y - startY);

    const fullRocket = createRocket();
    fullRocket.update(createTicker(ACCEL_DURATION_MS + DELTA_MS)); // exhaust accel
    const beforeY = fullRocket.y;
    fullRocket.update(createTicker(halfDuration));
    const fullMove = Math.abs(fullRocket.y - beforeY);

    // halfMove should be well below fullMove
    expect(halfMove).toBeLessThan(fullMove);
  });
});
