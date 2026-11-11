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
});
