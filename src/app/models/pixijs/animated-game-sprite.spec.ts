import { Texture } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { ObjectType } from './object-type.enum';
import { AnimatedGameSprite, MULTI_EXPLOSION_INTERVAL_MS } from './animated-game-sprite';

const LARGE_EXPLOSION_COUNT = 3;
const BOSS_EXPLOSION_COUNT = 5;
const EXPLOSION_TIMER_BUFFER_MS = 200;
const LARGE_EXPLOSION_SCALE = 2;

function createMockExplosionService(): jasmine.SpyObj<ExplosionService> {
  return jasmine.createSpyObj<ExplosionService>('ExplosionService', {
    explode: Promise.resolve(),
  });
}

function createSprite(
  explosionService: ExplosionService | null,
  explosionCount = 1,
  explosionScale = 1,
): AnimatedGameSprite {
  const sprite = new AnimatedGameSprite(ObjectType.enemy, explosionService, 1, [Texture.EMPTY]);
  sprite.explosionCount = explosionCount;
  sprite.explosionScale = explosionScale;
  return sprite;
}

describe('AnimatedGameSprite - explode()', () => {
  it('should trigger a single explosion and set destroying=true when explosionCount is 1', () => {
    const explosionService = createMockExplosionService();
    const sprite = createSprite(explosionService, 1);

    sprite.explode();

    expect(explosionService.explode).toHaveBeenCalledTimes(1);
    expect(sprite.destroying).toBeTrue();
  });

  it('should set destroying=true immediately even with explosionCount > 1', () => {
    const explosionService = createMockExplosionService();
    const sprite = createSprite(explosionService, LARGE_EXPLOSION_COUNT);

    sprite.explode();

    expect(sprite.destroying).toBeTrue();
  });

  it('should trigger the first explosion immediately when explosionCount > 1', () => {
    const explosionService = createMockExplosionService();
    const sprite = createSprite(explosionService, LARGE_EXPLOSION_COUNT);

    sprite.explode();

    // The first explosion fires immediately (no delay for i === 0)
    expect(explosionService.explode).toHaveBeenCalledTimes(1);
  });

  it('should trigger all explosions after delays when explosionCount is 3', (done) => {
    const explosionService = createMockExplosionService();
    const sprite = createSprite(explosionService, LARGE_EXPLOSION_COUNT);

    sprite.explode();

    // All 3 explosions fire: 1 immediately + 2 delayed by MULTI_EXPLOSION_INTERVAL_MS each
    const totalDelayMs = MULTI_EXPLOSION_INTERVAL_MS * (LARGE_EXPLOSION_COUNT - 1) + EXPLOSION_TIMER_BUFFER_MS;
    setTimeout(() => {
      expect(explosionService.explode).toHaveBeenCalledTimes(LARGE_EXPLOSION_COUNT);
      done();
    }, totalDelayMs);
  });

  it('should trigger all explosions after delays when explosionCount is 5 (boss)', (done) => {
    const explosionService = createMockExplosionService();
    const sprite = createSprite(explosionService, BOSS_EXPLOSION_COUNT);

    sprite.explode();

    // All 5 explosions fire: 1 immediately + 4 delayed by MULTI_EXPLOSION_INTERVAL_MS each
    const totalDelayMs = MULTI_EXPLOSION_INTERVAL_MS * (BOSS_EXPLOSION_COUNT - 1) + EXPLOSION_TIMER_BUFFER_MS;
    setTimeout(() => {
      expect(explosionService.explode).toHaveBeenCalledTimes(BOSS_EXPLOSION_COUNT);
      done();
    }, totalDelayMs);
  });

  it('should not trigger any explosion when explosionService is null', () => {
    const sprite = createSprite(null, 1);

    expect(() => sprite.explode()).not.toThrow();
    expect(sprite.destroying).toBeTrue();
  });

  it('should default explosionCount to 1', () => {
    const sprite = new AnimatedGameSprite(ObjectType.enemy, null, 1, [Texture.EMPTY]);

    expect(sprite.explosionCount).toBe(1);
  });

  it('should default explosionScale to 1', () => {
    const sprite = new AnimatedGameSprite(ObjectType.enemy, null, 1, [Texture.EMPTY]);

    expect(sprite.explosionScale).toBe(1);
  });

  it('should pass explosionScale to explode when explosionCount is 1', () => {
    const explosionService = createMockExplosionService();
    const sprite = createSprite(explosionService, 1, LARGE_EXPLOSION_SCALE);

    sprite.explode();

    expect(explosionService.explode).toHaveBeenCalledWith(
      jasmine.any(Number),
      jasmine.any(Number),
      LARGE_EXPLOSION_SCALE,
    );
  });

  it('should pass explosionScale to each explosion in chain when explosionCount > 1', (done) => {
    const explosionService = createMockExplosionService();
    const sprite = createSprite(explosionService, LARGE_EXPLOSION_COUNT, LARGE_EXPLOSION_SCALE);

    sprite.explode();

    const totalDelayMs = MULTI_EXPLOSION_INTERVAL_MS * (LARGE_EXPLOSION_COUNT - 1) + EXPLOSION_TIMER_BUFFER_MS;
    setTimeout(() => {
      explosionService.explode.calls.all().forEach((call) => {
        expect(call.args).toEqual([jasmine.any(Number), jasmine.any(Number), LARGE_EXPLOSION_SCALE]);
      });
      done();
    }, totalDelayMs);
  });
});
