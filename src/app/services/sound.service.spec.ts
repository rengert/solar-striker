import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';

describe('SoundService', () => {
  let service: SoundService;

  beforeEach(() => {
    localStorage.removeItem('sound-muted');
    localStorage.removeItem('music-muted');
    service = TestBed.inject(SoundService);
  });

  afterEach(() => {
    service.stopMusic();
    localStorage.removeItem('sound-muted');
    localStorage.removeItem('music-muted');
  });

  it('should remember the muted setting', () => {
    service.muted = true;

    expect(localStorage.getItem('sound-muted')).toBe('true');
    expect(new SoundService().muted).toBeTrue();
  });

  it('should remember the music setting separately', () => {
    service.musicMuted = true;

    expect(localStorage.getItem('music-muted')).toBe('true');
    expect(new SoundService().musicMuted).toBeTrue();
    expect(new SoundService().muted).toBeFalse();
  });

  it('should play every effect and every music track without throwing', () => {
    expect(() => {
      (
        ['laser', 'explosion', 'bigExplosion', 'hit', 'powerUp', 'click', 'bossWarning', 'stageClear', 'gameOver', 'victory'] as const
      ).forEach((effect) => service.play(effect));
      (['menu', 'campaign', 'endless', 'boss'] as const).forEach((track) => service.startMusic(track));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).scheduleMusic((service as any).context);
      service.stopMusic();
    }).not.toThrow();
  });

  it('should play a repeated effect from its pre-rendered buffer', async () => {
    service.play('laser');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internals = service as any;
    // eslint-disable-next-line no-magic-numbers
    for (let i = 0; i < 100 && ![...internals.sfxBuffers.values()].every(Boolean); i++) {
      // eslint-disable-next-line no-magic-numbers
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const ctx = internals.context as AudioContext;
    const oscillator = spyOn(ctx, 'createOscillator').and.callThrough();
    const source = spyOn(ctx, 'createBufferSource').and.callThrough();

    service.play('laser');

    expect(oscillator).not.toHaveBeenCalled();
    expect(source).toHaveBeenCalledTimes(1);
  });

  it('should keep synthesising live when offline rendering fails', async () => {
    spyOn(OfflineAudioContext.prototype, 'startRendering').and.callFake(() => Promise.reject(Error('no rendering')));
    service.play('click');
    // eslint-disable-next-line no-magic-numbers
    await new Promise((resolve) => setTimeout(resolve, 200));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (service as any).context as AudioContext;
    const oscillator = spyOn(ctx, 'createOscillator').and.callThrough();

    service.play('click');

    expect(oscillator).toHaveBeenCalledTimes(1);
  });
});
